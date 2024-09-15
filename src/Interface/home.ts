import type { ElementHandle } from "puppeteer"

export interface headInfo {
    logo: Buffer
    text: string[]
}

export interface searchResultTitleAndElement {
        title: string
        element: ElementHandle<HTMLElement>
}

export interface searchArticle {
    articlePic?:Buffer
    links?:string[]
    markdown?:string
}