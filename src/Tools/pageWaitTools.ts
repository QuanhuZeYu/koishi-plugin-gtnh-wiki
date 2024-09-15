import type { Page } from 'puppeteer'
import Data from '../Data'

async function waitNav(page: Page) {
    const baseData = Data.baseData
    const logger = baseData.logger
    const debug = baseData.debug
    try {
        await page.waitForNavigation({ timeout: baseData.config.navTimeout, waitUntil: "networkidle2" })
        debug('等待结束')
    } catch {
        debug('等待导航超时，但是继续')
    }
}

async function waitGoto(page: Page, url: string) {
    const baseData = Data.baseData
    const logger = baseData.logger
    const debug = baseData.debug

    try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: baseData.config.navTimeout })
        debug('等待结束')
    } catch {
        debug('等待goto超时，但是继续')
    }
}

async function waitNewPage(page: Page) {
    const baseData = Data.baseData
    const logger = baseData.logger
    // 等待新页面的打开（即新的标签页或窗口）
    const newPage: Page = await new Promise(async (resolve) => {
        baseData.browser.once('targetcreated', async target => {
            const newPage = await target.page() as Page;  // 获取新页面
            resolve(newPage);  // 返回新页面
        });
    })
    return newPage
}

const waitTools = {
    waitNav,
    waitGoto,
    waitNewPage,
}

export default waitTools