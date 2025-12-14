const fs = require("fs")
const path = require("path")
const util = require("./util.js")
const print = require("./print.js")
const PluginContext = require("./plugin_context.js")

const PluginManager = {
	plugins: new Map(), // 存放plugin的
	pluginContexts: new Map(), // 插件执行环境
	registerPlugin(p) {
		let filename = path.basename(p)
		let plugin;
		print.log(`正在加载插件文件:`, filename)
		try {
			plugin = require(p);
		} catch (e) {
			print.error(`获取插件模块时出错:`, e)
		}
		if (plugin.metaInfo && plugin.metaInfo.id) {
			let pluginId = plugin.metaInfo.id;
			PluginManager.plugins.set(pluginId, plugin);
			try {
				let c = new PluginContext(pluginId);
				plugin.main?.(c);
				// 没报错就报错上下文
				this.pluginContexts.set(pluginId, c);
				print.log(`成功载入插件: ${pluginId} (${filename})`)
			} catch (e) {
				print.error(`载入插件${plugin.metaInfo.id} (${filename})时出错:`, e)
			}
		} else {
			print.error(`无法载入插件文件"${filename}"，因为没有 metaInfo.id 字段`)
		}
	},
	// 加载所有插件
	loadAllPlugins() {
		print.log("开始加载插件")
		let files = util.getJsFiles(path.resolve("./plugins/"))
		files.forEach(this.registerPlugin, this);
	},
	/*// 卸载所有插件
	unloadAllPlugins() {
		
	}*/
	triggerQQMessage(msg) {
		// 遍历所有上下文
		//print.debug("[插件管理器] 拥有的插件上下文数: ", this.pluginContexts.size)

		this.pluginContexts.forEach(c => {
			c.triggerQQMessage(msg)
		})
	},
	
	saveAllPluginData() {
		this.pluginContexts.forEach(c => c.data.save())
	}
}

module.exports = PluginManager;