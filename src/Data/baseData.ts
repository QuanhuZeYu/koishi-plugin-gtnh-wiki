import {} from 'koishi-plugin-puppeteer'
import {LoggerService} from '@cordisjs/logger'
import type {Browser, Page} from 'puppeteer'
import type Sharp from 'sharp'
import { Config } from '..'

let config:Config
/**logger的带开关使用方式，读取配置决定是否输出日志 */
let debug:(...args:any[]) => void
let logger:LoggerService
let browser:Browser
let curPage:Page
let searchPage:Page

let sharp:typeof Sharp


const baseData = {
    config,
    debug,
    logger,
    browser,
    curPage,
    searchPage,

    sharp,
}

export default baseData