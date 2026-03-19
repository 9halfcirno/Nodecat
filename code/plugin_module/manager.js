import util from "../util.js";
import path from "path";
import Context from "./context.js";
import Command from "../command_manager.js";
import onExit from "../on_exit.js"
import fs from "fs"

/**
 * PluginManager
 * - 通过插件自身声明的 id 管理插件
 * - 文件名 ≠ 插件 id
 */

const PluginManager = {
	//pluginFiles: [],
	pluginLoaded: new Map(),
	pluginControlCommand: new Map(),
	pluginFileMap: new Map(),
	exports: new Map(),

	/**
	 * 扫描插件目录，收集每个插件的 index.js
	 * 文件夹名作为插件 id
	 */
	scanPluginFiles() {
		const pluginDir = path.resolve("./plugin/");
		const dirs = fs.readdirSync(pluginDir, {
			withFileTypes: true
		});
		const files = [];

		for (const dirent of dirs) {
			if (!dirent.isDirectory()) continue; // 只看文件夹
			const indexFile = path.join(pluginDir, dirent.name, "index.js");
			if (fs.existsSync(indexFile)) {
				files.push({
					id: dirent.name,
					file: indexFile
				});
				this.pluginFileMap.set(dirent.name, indexFile); // 直接建映射
			} else {
				console.warn(`[Plugin] 插件文件夹 "${dirent.name}" 中没有 index.js，将被忽略`);
			}
		}

		console.log(`[Plugin] 共找到 ${files.length} 个插件文件夹`);
		this.pluginFiles = files;
	},

	/**
	 * 按插件 id 加载
	 */
	async loadPlugin(id) {
		if (this.pluginLoaded.has(id)) return;

		// const file = this.pluginFileMap.get(id);
		// if (!file) throw new Error(`插件 ${id} 不存在`);
		const file = path.resolve(`./plugin/${id}/index.js`)
		
		const mod = await import(file + `?t=${Date.now()}`);
		const plugin = mod.default;
		if (!plugin) {
			throw new Error(`插件 ${id} 没有默认导出`);
		}
		if (plugin.enable === false) {
			console.log(`[Plugin] 插件 ${id} 标记为停用，停止加载`)
			return;
		}
		plugin.id = id;

		const ctx = new Context(plugin, this);
		ctx.pluginPath = path.dirname(file);
		ctx.plugin = plugin;

		try {
			if (this.pluginLoaded.has(id)) return;

			this.pluginLoaded.set(id, ctx);
			await ctx.init();

			// 兼容 control_command
			if (plugin.control_command) {
				this.pluginControlCommand.set(plugin.control_command, id);
			}

			console.log(`[Plugin] 成功载入插件 "${id}"`);
		} catch (e) {
			console.error(`[Plugin] 载入插件 "${id}" 失败! Error: ${e.message}`);
		}
	},

	async unloadPlugin(id) {
		const ctx = this.pluginLoaded.get(id);
		if (!ctx) {
			return false;
			throw new Error(`插件 ${id} 未被启用`)
		};

		try {
			await ctx.unload();
		} catch(e) {
			console.error(`[Plugin] 停用 ${id} 时发生错误！Error:${e.message}`)
		} finally {
			this.pluginLoaded.delete(id);
		}
		return true;
	},

	async reloadPlugin(id) {
		await this.unloadPlugin(id);
		await this.loadPlugin(id);
	},

	triggerMessage(msg) {
		for (const ctx of this.pluginLoaded.values()) ctx.triggerMessage(msg);
	},
	triggerMessageSent(msg) {
		for (const ctx of this.pluginLoaded.values()) ctx.triggerMessageSent(msg);
	},
	triggerNotice(data) {
		for (const ctx of this.pluginLoaded.values()) ctx.triggerNotice(data);
	},
	triggerRequest(req) {
		for (const ctx of this.pluginLoaded.values()) ctx.triggerRequest(req);
	}
};

export default PluginManager;

/* ===========================
 * 插件管理指令
 * =========================== */

Command.register("plugin", async (msg, args) => {
	const reply = [];
	let ids; // 获取插件id
	if (args[1] === "@all") {
		PluginManager.scanPluginFiles();
		ids = PluginManager.pluginFileMap.keys();
	} else {
		ids = [args[1]]
	}
	switch (args[0]) {
		case "list":
			reply.push("Nodecat 已加载插件列表:");
			reply.push(...PluginManager.pluginLoaded.keys())
			break;
		case "load":
			for (let id of ids) {
				try {
					await PluginManager.loadPlugin(id);
					reply.push(`插件 ${id} 已启用`)
				} catch (e) {
					reply.push(`插件 ${id} 启用失败！Error:${e.message}`)
				}
			}
			break;
		case "unload":
			for (let id of ids) {
				try {
					await PluginManager.unloadPlugin(id);
					reply.push(`插件 ${id} 已停用`)
				} catch (e) {
					reply.push(`插件 ${id} 停用失败！Error:${e.message}`)
				}
			}
			break;
		case "reload":
			for (let id of ids) {
				try {
					await PluginManager.reloadPlugin(id);
					reply.push(`插件 ${id} 已重载`)
				} catch (e) {
					reply.push(`插件 ${id} 重载失败！Error:${e.message}`)
				}
			}
			break;
	};
	msg.reply(reply.join("\n"))
}, {
	permission: "operator"
});

onExit(async () => {
	console.log(`[Plugin] 正在停用所有插件`)
	for (let id of PluginManager.pluginLoaded.keys()) {
		await PluginManager.unloadPlugin(id);
	}
})

Command.register("on", async (msg, args) => {

}, {
	permission: "admin",
	only: "group"
})