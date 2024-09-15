import Data from "../Data"
import { headInfo, searchArticle, searchResultTitleAndElement } from "../Interface/home"
import type { Page,ElementHandle } from 'puppeteer'
import tools from "../Tools"
import { sleep } from "koishi"


async function getHeadePost() {
	const baseData = Data.baseData
	const logger = baseData.logger
	const debug = baseData.debug
	const curPage = baseData.curPage

	debug('开始获取页面头部信息');
	const headPostInfo: { logo: string, text: string[] } = await curPage.evaluate(async () => {
		const headSection = document.querySelector('article section');
		if (!headSection) {
			console.error('Head section not found');
			return;
		}

		const bigLOGOElement = headSection.querySelector('img');
		const headTextElement_head = headSection.querySelector('div div + p');
		if (!headPostInfo) {
			return null;
		}
		const headTextElements = [headTextElement_head];
		let p_TYPE = true;

		while (p_TYPE) {
			const nextElement = headTextElements[headTextElements.length - 1]?.nextElementSibling;
			if (nextElement && nextElement.tagName === 'P') {
				headTextElements.push(nextElement);
			} else {
				p_TYPE = false;
			}
		}

		// 通用的 HTML 转 Markdown 函数，处理元素中的超链接
		const toMarkdown = (element) => {
			if (!element) return ''; // 确保传入的元素存在
			// 获取元素的纯文本
			let textContent = element.textContent || '';
			// 查找所有 <a> 标签并替换为 Markdown 格式
			const linkElements = element.querySelectorAll('a');
			linkElements.forEach(linkElement => {
				if (linkElement) {
					const linkText = linkElement.textContent || '';
					const linkHref = linkElement.href || '#';
					const markdownLink = `  [${linkText}](${linkHref})  `;

					// 用 markdownLink 替换原始文本中的链接文本
					textContent = textContent.replace(linkText, markdownLink);
				}
			});

			return textContent.trim(); // 返回去除多余空白的文本
		};
		// 获取大 LOGO 的 URL，如果存在的话
		const bigLOGO_URL = bigLOGOElement ? bigLOGOElement.src : '';
		// 收集头部文本信息，转换为 Markdown 格式
		const textInfo: string[] = headTextElements.map((element) => {
			return toMarkdown(element);
		});
		const headInfo = {
			logo: bigLOGO_URL,
			text: textInfo
		}
		return headInfo
	})
	const logo = Buffer.from(await (await fetch(headPostInfo.logo)).arrayBuffer())
	const headInfo: headInfo = {
		logo: logo,
		text: headPostInfo.text
	}
	tools.pageTools.waitTools.waitGoto(curPage,"https://gtnh.huijiwiki.com/")
	debug('返回主页 -> 页面导航到 GTNH Wiki 完成')
	baseData.curPage = curPage
	return headInfo
}

// region 搜索操作
async function search(s: string) {
	const baseData = Data.baseData;
	const logger = baseData.logger;
	const debug = baseData.debug
	const sharp = baseData.sharp

	debug(`搜索操作单独打开新页面`)
	const curPage = await baseData.browser.newPage();
	await curPage.bringToFront()
	await tools.pageTools.waitTools.waitGoto(curPage,"https://gtnh.huijiwiki.com/")
	try {
		const searchRegion = await curPage.$('header input');
		debug(`找到 搜索框`)
		await searchRegion.type(s, { delay: 100 });
		debug(`搜索框键入 ${s}`)
		await searchRegion.press('Enter');
		debug(`搜索框提交，等待捕获 新页面`)

		// 等待新页面的打开（即新的标签页或窗口）
		const searchPage: Page = await tools.pageTools.waitTools.waitNewPage(curPage)
		if (!searchPage) {
			logger.warn(`搜索时出现错误: 无法获取新页面`)
			curPage.close()
			return null
		}
		curPage.close()
		debug(`新页面已捕获，旧页面已关闭`)
		await searchPage.bringToFront()
		await sleep(2000)

		const isSearchPage = await (await searchPage.$('header')).evaluate(e => e.textContent.includes('搜索结果'))
		if(!isSearchPage) {
			const result = await searchPage.screenshot({
				fullPage:true
			})
			searchPage.close()
			// 裁去上方1080px
			const meta = await sharp(result).metadata()
			let height = meta.height
			if(meta.height > 1080*3) {
				height = height - 1080
			}
			return await sharp(result).extract({
				left:0,
				top:1080,
				width:meta.width,
				height:height
			}).toBuffer()
		}
		
		// 获取搜索结果
		const resultListElement = await searchPage.$$('main p + ul li');
		const titleList: searchResultTitleAndElement[] = (await Promise.all(
			resultListElement.map(async (element) => {
				const titleElement = await element.$('a'); if (!titleElement) { return };
				const title = await titleElement.evaluate(el => el.getAttribute('title'));
				return {
					title: title,
					element: element
				};
			})
		)).filter(Boolean)
		baseData.searchPage = searchPage  // 缓存搜索页面
		debug(`搜索结果: ${titleList}`)
		return titleList;
	} catch (e) {
		logger.warn(`搜索时出现错误: `, e);
	}
}

async function gotoListIndex(titleList: searchResultTitleAndElement[], index: number) {
	const baseData = Data.baseData
	const logger = baseData.logger
	const debug = baseData.debug
	const searchPage = baseData.searchPage
	index = index - 1

	try {
		const selectElement = await(await titleList[index].element.$('a')).evaluate(el => {
			return el.click()
		})
		debug('点击元素')
		debug(`已点击 第 ${index + 1} 个搜索结果`)
		await tools.pageTools.waitTools.waitNav(searchPage)
		const titleAndLinks = await searchPage.evaluate(async () => {
			const element = document.querySelector('article')
			const all_a = Array.from(element.querySelectorAll('a'))
			const titleAndLinks = Promise.all(
				all_a.map(async a => {
					const title = a.getAttribute('title')||'无标题'
					const href = a.href||'#'
					return `[${title}](${href})`
				})
			)
			return titleAndLinks
		})
		
		const articleElement = await searchPage.$('main article')
		// const markdown = await tools.convertTools.handleArticle(articleElement)
		const articlePic = Buffer.from(await searchPage.screenshot({
			fullPage:true
		}))

		const searchResult:searchArticle = {
			articlePic:articlePic
		}
		return searchResult
	} catch (e) {
		logger.warn(`搜索时出现错误: `, e)
	} finally {
		await closeSearch()
		debug(`搜索流程结束 关闭搜索页面`)
	}
}

/**
 * 释放搜索页面
 */
async function closeSearch() {
	const baseData = Data.baseData
	const logger = baseData.logger
	const searchPage = baseData.searchPage

	await searchPage.close()
	baseData.searchPage = null
}

// endregion

const searchController = {
	search,
	closeSearch,
	gotoListIndex
}

const homeController = {
	getHeadePost,
	searchController
}

export default homeController