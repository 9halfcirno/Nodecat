const fs = require("fs")
const path = require("path")
const util = require("./util.js")
const print = require("./print.js")
const PluginContext = require("./plugin_context.js")
const PluginExports = require("./plugin_exports.js")

const PluginManager = {
	plugins: new Map(), // id -> plugin 模块
	pluginContexts: new Map(), // id -> PluginContext
	loaded: new Set(), // 已加载完成
	loading: new Set(), // 正在加载（防循环依赖）
	registerPluginFile(p) {
		let filename = path.basename(p)
		print.log(`读取插件文件:`, filename)
		let plugin
		try {
			plugin = require(p)
		} catch (e) {
			return print.error(`加载插件文件失败:`, e)
		}
		if (!plugin.metaInfo?.id) {
			return print.error(`插件 ${filename} 缺少 metaInfo.id`)
		}
		if (this.plugins.has(plugin.metaInfo.id)) {
			return print.error(`插件文件 ${filename} 声明重复id: ${plugin.metaInfo.id}`)
		}
		this.plugins.set(plugin.metaInfo.id, plugin)
	},
	loadPluginById(id) {
		// 已加载，直接跳过
		if (this.loaded.has(id)) return
		// 正在加载，说明出现循环依赖
		if (this.loading.has(id)) {
			throw new Error(`检测到插件循环依赖: ${id}`)
		}
		const plugin = this.plugins.get(id)
		if (!plugin) {
			throw new Error(`未找到依赖插件: ${id}`)
		}
		this.loading.add(id)
		// 1. 先递归加载依赖
		const requires = plugin.requires ?? []
		for (const depId of requires) {
			this.loadPluginById(depId)
		}
		// 2. 执行插件 main
		const ctx = new PluginContext(id)
		try {
			plugin.main?.(ctx)
			this.pluginContexts.set(id, ctx)
			this.loaded.add(id)
			print.log(`成功载入插件: ${id}`)
		} catch (e) {
			print.error(`插件 ${id} 执行失败:`, e)
		}
		this.loading.delete(id)
	},
	// 加载所有插件
	loadAllPlugins() {
		print.log("开始加载插件")
		const files = util.getJsFiles(path.resolve("./plugins/"))
		// ① 先读取所有插件文件
		files.forEach(f => this.registerPluginFile(f))
		// ② 再按依赖顺序加载
		for (const id of this.plugins.keys()) {
			this.loadPluginById(id)
		}
	},
	triggerQQMessage(msg) {
		// 遍历所有上下文
		//print.debug("[插件管理器] 拥有的插件上下文数: ", this.pluginContexts.size)

		this.pluginContexts.forEach(c => {
			c.triggerQQMessage(msg)
		})
	},
	triggerQQMessageSent(msg) {
		// 遍历所有上下文
		//print.debug("[插件管理器] 拥有的插件上下文数: ", this.pluginContexts.size)

		this.pluginContexts.forEach(c => {
			c.triggerQQMessageSent(msg)
		})
	},
	triggerQQNotice(data) {
		this.pluginContexts.forEach(c => {
			c.triggerQQNotice(data)
		})
	},
	triggerQQRequest(request) {
		this.pluginContexts.forEach(c => {
			c.triggerQQRequest(request)
		})
	},

	saveAllPluginData() {
		this.pluginContexts.forEach(c => c.data.filePath && c.data.saveSync())
	}
}

// 引用模块对象
PluginExports.plugins = PluginManager.plugins;

module.exports = PluginManager;