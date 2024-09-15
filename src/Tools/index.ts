
import handleArticle from "./articlePageHandle"
import autoScroll from "./autoScroll"
import captureFullElementScreenshot from "./capture"
import debug from "./debug"
import waitTools from "./pageWaitTools"



const convertTools = {
    handleArticle
}

const pageTools = {
    waitTools,autoScroll,captureFullElementScreenshot
}

const tools = {
    debug,
    pageTools,
    convertTools
}

export default tools