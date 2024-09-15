import fs from 'fs'
import Data from '../Data'
import type {ElementHandle,Page} from 'puppeteer';
import { sleep } from 'koishi';

async function captureFullElementScreenshot(page:Page, elementHandle:ElementHandle):Promise<Buffer> {
    const baseData = Data.baseData
    const debug = baseData.debug
    // 保存原始视口大小
    const originalViewport = page.viewport();

    // 获取目标元素的尺寸
    const boundingBox = await elementHandle.boundingBox();
    const totalHeight = boundingBox.height;
    const viewportHeight = 1080; // 每次截图的最大高度
    const viewportWidth = originalViewport.width

    if(totalHeight <= viewportHeight) {
        const pic = Buffer.from(await elementHandle.screenshot({}))
        return pic
    }

    // 计算需要截取的次数
    const numScreenshots = Math.floor(totalHeight / viewportHeight);
    let buffers = []; // 存储每个截图的 Buffer

    // 循环截取每一段图片
    for (let i = 0; i < numScreenshots; i++) {
        const y = i * viewportHeight;

        // 确保宽度和高度是整数
        const width = viewportWidth
        const height = Math.floor(Math.min(viewportHeight, totalHeight - y))

        debug(`Setting viewport: width=${width}, height=${height}`);

        // 设置页面视口的高度和宽度
        await page.setViewport({
            width: width,
            height: height,
        });

        // 滚动到元素的正确位置
        await page.evaluate((el, scrollY) => {
            el.scrollIntoView();
            window.scrollTo(0, scrollY);
        }, elementHandle, boundingBox.y + y);
        await sleep(500)
        // 截取当前视口的截图并保存为 Buffer
        const buffer = await page.screenshot({
            type: 'png',
            clip: {
                x: 0,
                y: Math.floor(boundingBox.y),
                width: width,
                height: height,
            }
        });
        // 将 Buffer 存储到 buffers 数组中
        buffers.push(buffer);
    }
    // 拼接截图并返回完整图片的 Buffer
    const fullImageBuffer = await combineScreenshots(buffers, totalHeight, viewportWidth);
    // 恢复原始视口大小
    await page.setViewport(originalViewport);
    return fullImageBuffer;
}

// 用于拼接图片
async function combineScreenshots(buffers:Buffer[], totalHeight:number, viewportWidth:number) {
    const baseData = Data.baseData
    const sharp = baseData.sharp
    // 创建一个全尺寸的空白图像
    const compositeImage = sharp({
        create: {
            width: Math.ceil(viewportWidth),
            height: Math.ceil(totalHeight),
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 0 }
        }
    });

    // 拼接所有截图的 Buffer
    return await compositeImage.composite(
        await Promise.all(buffers.map((buffer, index) => ({
            input: buffer,
            top: index * 1080, // 每个图片的 Y 位置
            left: 0
        })))
    ).png().toBuffer(); // 返回完整图片的 Buffer
}

export default captureFullElementScreenshot
