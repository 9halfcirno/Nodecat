import util from "../util.js"
import path from "path"
import Context from "./context.js"

class PluginManager {
	constructor() {
		this.pluginFiles = [];
		this.pluginLoaded = new Map();
	}

	scanPluginFiles() {
		const files = util.getJsFiles(path.resolve("./plugin/"))
		console.log(`[Plugin] 共找到 ${files.length} 个插件文件!`)
		this.pluginFiles.push(...files)
	}

	async loadPlugin(url) {
		const module = await import(url);
		const plugin = module.default;
		if (!plugin) { // 没有导出
			console.warn(`[Plugin] 文件"${url}"没有默认导出`)
			return;
		}
		if (!plugin.id) {
			console.warn(`[Plugin] 无法加载文件"${path.basename(url)}"!`);
			return;
		}
		let ctx = new Context(plugin);
		this.pluginLoaded.set(plugin.id, ctx);
		try {
			await ctx.init();
			console.log(`[Plugin] 成功载入插件"${plugin.id}"`)
		} catch(e) {
			console.error(`[Plugin] 载入插件"${plugin.id}"时出现错误!\nError: ${e.message}\n${e.stack}`)
		}
	}
	
	triggerMessage(msg) {
		this.pluginLoaded.forEach(ctx => ctx.triggerMessage(msg))
	}
	
	triggerMessageSent(msg) {
		this.pluginLoaded.forEach(ctx => ctx.triggerMessageSent(msg))
	}
}

export default PluginManager