import { Context } from "koishi"
import Data from "../Data"
import type { Browser } from "puppeteer"
import tools from "../Tools"



async function baseSetup(ctx:Context) {
    const baseData = Data.baseData
    
    baseData.config = ctx.config
    const logger = baseData.logger = ctx.logger
    baseData.debug = tools.debug
    baseData.browser = ctx.puppeteer.browser as any as Browser
    baseData.sharp = ctx.QhzySharp.Sharp
    logger.info(`插件基础数据初始化完成`)
    await selectPage()
}

async function selectPage() {
    const baseData = Data.baseData;
    const logger = baseData.logger;
    const debug = baseData.debug;
    const browser = baseData.browser;
    const pages = await browser.pages();
    const selectPages = (await Promise.all(
        pages.map(async page => {
            const url = page.url();
            if (url.includes('gtnh.huijiwiki')) {
                debug(`找到页面: ${url}`);
                return page;
            }
            return null;  // 确保返回值为null而不是undefined
        })
    )).filter(page => page !== null);  // 过滤掉null值
    // 如果找到页面，选择第一个匹配的页面，否则打开一个新页面
    const selectPage = selectPages.length > 0 ? selectPages[0] : await browser.newPage();
    // 导航到指定网址
    await selectPage.goto('https://gtnh.huijiwiki.com/');
    baseData.curPage = selectPage;
    debug(`已选取页面: ${selectPage.url()}`);
}


const baseDataSetup = {
    baseSetup
}

export default baseDataSetup