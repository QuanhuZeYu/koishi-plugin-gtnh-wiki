import { Context, Schema } from 'koishi'
import {} from 'koishi-plugin-puppeteer'
import {} from '@quanhuzeyu/koishi-plugin-qhzy-sharp'
import myEvent from './Event'
import commands from './Commands'

export const name = 'gtnh-wiki'

export const inject = {
	required: ['puppeteer', 'QhzySharp']
}

export interface Config { 
	debug: boolean
	navTimeout: number
	searchWaitReplyTime: number
}

export const Config: Schema<Config> = Schema.object({
	debug: Schema.boolean().default(false).description('是否开启调试模式'),
	navTimeout: Schema.number().default(5000).description('导航超时时间'),
	searchWaitReplyTime: Schema.number().default(60000).description('搜索等待回复的时间')
})

export function apply(ctx: Context) {
	myEvent.baseDataSetup.baseSetup(ctx)

	const gtnhCMD = ctx.command('gtnh', '获取GTNH-wiki的相关信息')
		.action((argv,message) => {
			commands.getHeadPoster(argv,message)
		})
	gtnhCMD.subcommand('gtnh-search [message:text]').alias('gtnh-搜索 [message:text]')
		.action((argv,message) => {
			commands.search(argv, message)
		})
}
