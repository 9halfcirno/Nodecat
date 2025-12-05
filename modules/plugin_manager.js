const fs = require("fs")
const path = require("path")
const util = require("./util.js")
const print = require("./print.js")
const Nodecat = require("./nodecat.js")

const PluginManager = {
	plugins: new Map(), // 存放plugin的
	pluginRegisterQQMessageHandler: new Map(), // 存放插件注册的触发器
	registerPlugin(p) {
		let plugin = require(p);
		if (plugin.metaInfo && plugin.metaInfo.id) {
			let pluginId = plugin.metaInfo.id;
			PluginManager.plugins.set(pluginId, plugin);
			try {
				plugin.main?.(Nodecat);
			} catch(e) {
				print.error(`载入插件${plugin.metaInfo.id}时出错:`, e)
			}
		} else {
			print.error(`无法载入插件"${p}"，因为没有 metaInfo.id 字段`)
		}
	},
	// 加载所有插件
	loadAllPlugins() {
		let files = util.getJsFiles(path.resolve("./plugins/"))
		files.forEach(this.registerPlugin);
	},
	/*// 卸载所有插件
	unloadAllPlugins() {
		
	}*/
}

module.exports = PluginManager;