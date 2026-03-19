import util from "../util.js";
import path from "path";
import Context from "./context.js";
import Command from "../command_manager.js";
import onExit from "../on_exit.js"
<<<<<<< HEAD
import fs from "fs"
=======
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946

/**
 * PluginManager
 * - 通过插件自身声明的 id 管理插件
 * - 文件名 ≠ 插件 id
 */
<<<<<<< HEAD

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

=======
const PluginManager = {
	/** 插件文件路径列表 */
	pluginFiles: [],

	/** 已加载插件 id -> Context */
	pluginLoaded: new Map(),

	/** 插件 id -> 文件路径 */
	pluginFileMap: new Map(),

	/** 插件导出 -> 导出值 */
	exports: new Map(),

	/**
	 * 扫描插件目录，仅收集文件
	 */
	scanPluginFiles() {
		const files = util.getJsFiles(path.resolve("./plugin/"));
		console.log(`[Plugin] 共找到 ${files.length} 个插件文件`);
		this.pluginFiles = files;
	},

	/**
	 * 建立插件 id -> 文件路径映射
	 * 只 import，不 init
	 */
	async indexPlugins() {
		this.pluginFileMap.clear();

		for (const file of this.pluginFiles) {
			try {
				if (path.basename(file)[0] === ".") continue;
				const mod = await import(file);
				const plugin = mod.default;

				if (!plugin || !plugin.id) {
					console.warn(`[Plugin] 插件文件无有效 id: ${file}`);
					continue;
				}
				if (plugin.enable === false) {
					console.log(`[Plugin] 插件 "${plugin.id}" 标记为停用，将被忽略`);
					continue;
				}

				this.pluginFileMap.set(plugin.id, file);
			} catch (e) {
				console.warn(`[Plugin] 索引插件失败: ${file}`);
				console.warn(e);
			}
		}

		console.log(`[Plugin] 已索引 ${this.pluginFileMap.size} 个插件`);
	},

	/**
	 * 按插件 id 加载
	 */
	async loadPluginById(id) {
		if (this.pluginLoaded.has(id)) {
			return;
			//throw new Error(`插件 "${id}" 已加载`);
		}

		const file = this.pluginFileMap.get(id);
		if (!file) {
			throw new Error(`插件 "${id}" 不存在`);
		}

		// ⚠️ 加时间戳避免 ESM import 缓存
		const mod = await import(file + `?t=${Date.now()}`);
		const plugin = mod.default;

		if (!plugin) {
			throw new Error(`插件 "${id}" 加载失败`);
		}

		const ctx = new Context(plugin, this);

		try {
			if (this.pluginLoaded.has(id)) {
				return;
			}
			this.pluginLoaded.set(id, ctx);
			await ctx.init();
			console.log(`[Plugin] 成功载入插件 "${id}"`);
		} catch (e) {
			console.error(`[Plugin] 载入插件 "${id}" 失败! Error: ${e.message}`);
		}
	},

	/**
	 * 卸载插件
	 */
	async unloadPlugin(id) {
		const ctx = this.pluginLoaded.get(id);
		if (!ctx) return false;

		try {
			await ctx.unload();
		} finally {
			this.pluginLoaded.delete(id);
		}
		return true;
	},

	/**
	 * 重新加载插件
	 */
	async reloadPlugin(id) {
		await this.unloadPlugin(id);
		await this.loadPluginById(id);
	},

	/**
	 * 触发消息事件
	 */
	triggerMessage(msg) {
		for (const ctx of this.pluginLoaded.values()) {
			ctx.triggerMessage(msg);
		}
	},

	triggerMessageSent(msg) {
		for (const ctx of this.pluginLoaded.values()) {
			ctx.triggerMessageSent(msg);
		}
	}
};

>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
export default PluginManager;

/* ===========================
 * 插件管理指令
 * =========================== */

Command.register("plugin", async (msg, args) => {
<<<<<<< HEAD
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
=======
	const action = args[0];
	const target = args[1];

	if (!action || !target) {
		msg.reply("用法: plugin <load|unload|reload> <插件ID|@all>");
		return;
	}

	const ids =
		target === "@all" ? [...PluginManager.pluginFileMap.keys()] : [target];

	if (ids.length === 0) {
		msg.reply("没有可操作的插件");
		return;
	}

	try {
		switch (action) {
			case "load":
				for (const id of ids) {
					if (PluginManager.pluginLoaded.has(id)) continue;
					await PluginManager.loadPluginById(id);
				}
				msg.reply("插件已启用");
				break;

			case "unload":
				for (const id of ids) {
					await PluginManager.unloadPlugin(id);
				}
				msg.reply("插件已停用");
				break;

			case "reload":
				for (const id of ids) {
					await PluginManager.reloadPlugin(id);
				}
				msg.reply("插件已重载");
				break;

			default:
				msg.reply("未知操作，请使用 load / unload / reload");
		}
	} catch (e) {
		msg.reply(`插件操作失败: ${e.message}`);
	}
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
}, {
	permission: "operator"
});

onExit(async () => {
	console.log(`[Plugin] 正在停用所有插件`)
<<<<<<< HEAD
	for (let id of PluginManager.pluginLoaded.keys()) {
		await PluginManager.unloadPlugin(id);
	}
})

Command.register("on", async (msg, args) => {

}, {
	permission: "admin",
	only: "group"
=======
	for (let id of PluginManager.pluginLoaded.values()) {
		await PluginManager.unloadPlugin(id);
	}
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
})