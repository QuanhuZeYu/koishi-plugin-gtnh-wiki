import { Argv, h } from "koishi";
import Data from "../Data";
import gtnhPage from "../Page";


async function search(argv: Argv, message: string) {
    const baseData = Data.baseData
    const logger = baseData.logger
    const session = argv.session
    const debug = baseData.debug

    const searchResult = await gtnhPage.homeController.searchController.search(message);
    if (!searchResult || searchResult.length === 0) {
        await session.send('搜索结果为空，或搜索时出现错误');
        return;
    }
    if(searchResult instanceof Buffer) {
        debug(`搜索结果为 Buffer 直接发送结果`)
        return await session.send(h.image(searchResult, 'image/png'))
    }

    const searchListText = (await Promise.all(
        searchResult.map(async (obj, index) => {
            const title = obj.title || '无标题';  // 如果 title 为 null，则提供默认值
            const info = await obj.element.evaluate(el => el?.textContent || '无内容');  // 处理 textContent 可能为 null 的情况
            return `${index + 1}. ${title}:\n${info.trim()}`;  // 按序号排列
        })
    )).join('\n\n');

    let messageStruct = <message forward={true}>
        <quote id={session.messageId}/>
        {`请发送下列搜索结果的序号来查看具体内容:\n等待时间: ${baseData.config.searchWaitReplyTime}\n\n`}
        {searchListText}
    </message>;
    await session.send(messageStruct)
    const index: number = Number(await session.prompt(baseData.config.searchWaitReplyTime))
    if (!index) {
        await gtnhPage.homeController.searchController.closeSearch()
    } else if (index && (index < 0 || index >= searchResult.length)) {
        await gtnhPage.homeController.searchController.closeSearch()
    } else {
        const result = await gtnhPage.homeController.searchController.gotoListIndex(searchResult, index)
        const pic = result?.articlePic ? <img src={"data:image/png;base64," + result.articlePic.toString('base64')}/> : ''
        messageStruct = <message forward={false}>
            <quote id={session.messageId}/>
            {pic}
            {result?.links ? (result.links.join('\n').length > 1500 ? '链接过长，已屏蔽':result.links.join('\n')) : ''}
            {result?.markdown ? result.markdown : ''}
        </message>;
        await session.send(messageStruct)
    }
}

export default search