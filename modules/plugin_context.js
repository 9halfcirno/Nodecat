const DataMap = require("./data_map.js")
const path = require("path")
const QQMessage = require("./qq_message.js")
const Queue = require("./queue.js")
const onebot = require("../OneBot v11.js")
const util = require("./util.js")
const client = require("./ws_client.js")
const PluginExports = require("./plugin_exports.js")
//todo const blacklist = require("./black_list.js")

class QQMessageTrigger { // 消息触发器类
	constructor(predicate, callback) {
		this.predicate = predicate;
		this.callback = callback;
		this.uuid = util.uuid();
	}
	test(msg) { // 如果断言成功，则调用回调
		this.predicate?.(msg) && this.callback?.(msg)
	}
}

class QQNoticeTrigger {
	constructor(type, cb) {
		// 说明忽略了type，直接传入了回调
		if (typeof type === "function") {
			this.type = "all";
			this.cb = type;
		} else {
			this.type = type
			this.cb = cb; //当看到OneBot v11协议那么多类型时，我释怀了}
			this.uuid = util.uuid();
		}
	}

	test(data) {
		if (this.type === "all") { // 全部接收
			this.cb?.(data)
			return;
		}
		if (data.post_type === onebot.EventType.NOTICE && data.notice_type === this.type) this.cb?.(data);
	}
}

class QQMessageSentTrigger {
	constructor(cb) {
		this.cb = cb;
		this.uuid = util.uuid();
	}
	test(data) {
		this.cb?.(data);
	}
}

class QQRequestTrigger {
	constructor(cb) {
		this.cb = cb;
		this.uuid = util.uuid();
	}
	test(request) {
		this.cb?.(request);
	}
}

class PluginContext { // 插件注册上下文
	constructor(id, opts = {}) {
		this.id = id;
		this.messageTriggers = new Map(); // 自己的触发器
		this.noticeTriggers = new Map();
		this.requestTriggers = new Map();
		this.messageSentTriggers = new Map();

		// 自定义ws处理器
		this.customWSMessageHandler = new Map();

		// 插件数据存储
		let file = path.join(NodecatConfig.nodecat_run_path, "storage/data/plugins/", `${id}.json`)
		this.dataMap = new DataMap(file)

		// 待发送消息
		this.messageSendQueue = new Queue([], this.#reallySendMessage)

		// 所有action队列
		this.actionQueue = new Queue([], this.#reallySendAction)
	}

	// es2022享受者😋
	// 真的发送消息的方法
	#reallySendMessage(msg) {
		let p;
		if (msg.to === "group") {
			p = client.tellNapcatPromise("send_group_msg", {
				group_id: msg.group_id,
				message: msg.content
			})
		} else if (msg.to === "friend") {
			p = client.tellNapcatPromise("send_msg", {
				user_id: msg.user_id,
				message: msg.content,
				message_type: "private"
			})
		} else {
			p = client.tellNapcatPromise("send_msg", {
				group_id: msg.group_id,
				user_id: msg.user_id,
				message: msg.content,
				message_type: "private"
			})
		}
		return p;
	}

	#reallySendAction(obj = {}) {
		let {
			action,
			...params
		} = obj;
		return client.tellNapcatPromise(action, {
			...params
		});
	}

	registerQQMessageTrigger(trigger) {
		this.messageTriggers.set(trigger.uuid, trigger)
	}
	registerQQNoticeTrigger(trigger) {
		this.noticeTriggers.set(trigger.uuid, trigger)
	}
	registerQQRequestTrigger(trigger) {
		this.requestTriggers.set(trigger.uuid, trigger)
	}
	registerQQMessageSentTrigger(trigger) {
		this.messageSentTriggers.set(trigger.uuid, trigger)
	}

	// 触发消息
	triggerQQMessage(msg) {
		// 遍历自己的消息处理器列表
		this.messageTriggers.forEach(t => {
			t.test(msg);
		})
	}

	// 虽然写notice，实际上收到的是原始数据
	triggerQQNotice(notice) {
		this.noticeTriggers.forEach(t => {
			t.test(notice)
		})
	}

	triggerQQMessageSent(msg) {
		this.messageSentTriggers.forEach(t => {
			t.test(msg)
		})
	}
	
	triggerQQRequest(re) {
		this.requestTriggers.forEach(t => {
			t.test(re)
		})
	}

	get data() {
		return this.dataMap
	}

	get path() {
		return {
			storage: path.resolve(NodecatConfig.nodecat_run_path, "storage")
		}
	}

	set exports(obj) { // 导出
		PluginExports.exports.set(this.id, obj)
	}

	require(id) { // 请求插件id
		return PluginExports.require(id)
	}

	// 返回 [[name, pluginObject], [...]]的数组
	// 可以安全调用，因为插件运行时，所有插件都已经被注册
	get plugins() {
		const plugins = PluginExports.plugins;
		const returnPlugins = [];
		// 迭代所有插件
		for (const [name, plugin] of plugins.entries()) {
			const {
				main,
				...rest
			} = plugin;
			returnPlugins.push([name, rest]);
		}
		return returnPlugins;
	}

	//消息触发器
	get onMessage() { // 返回Chat上预定义的处理器类型
		let self = this;
		if (!this.onMessageProxy) { // 缓存代理对象
			this.onMessageProxy = new Proxy({}, { // 代理对象，减少代码重复，方便维护
				get(obj, key) { // onMessage.xxx是获取后调用，所以是get
					if (key in PluginContext.onMessageHandler) {
						return (...args) => { // 返回一个函数
							PluginContext.onMessageHandler[key].call(self, ...args)
						}
					} else throw new Error(`插件"${self.id}"尝试注册${key}触发器，但是没有该触发器`);
				}
			})
		}
		return this.onMessageProxy;
	}

	onMessageSent(cb) {
		this.registerQQMessageSentTrigger(new QQMessageSentTrigger(cb))
	}

	onNotice(type, cb) {
		this.registerQQNoticeTrigger(new QQNoticeTrigger(type, cb))
	}
	
	onRequest(cb) {
		this.registerQQRequestTrigger(new QQRequestTrigger(cb))
	}

	sendGroupMessage(group, msg, opts = {}) {
		if (!["string", "number"].includes(typeof group)) return;
		let action = {
			action: "send_group_msg",
			group_id: group.toString(), // 修正了拼写错误: grouo_id -> group_id
			message: msg,
		};
		if (opts.queue !== false) {
			this.actionQueue.add(action)
		} else {
			this.#reallySendAction(action)
		}
	}

	sendFriendMessage(friend, msg, opts = {}) {
		if (!["string", "number"].includes(typeof friend)) return;
		let action = {
			action: "send_private_msg",
			user_id: friend.toString(),
			message: msg,
		};
		if (opts.queue !== false) {
			this.actionQueue.add(action)
		} else {
			this.#reallySendAction(action)
		}
	}

	sendPrivateMessage(group, user, msg, opts = {}) {
		if (!["string", "number"].includes(typeof group) || !["string", "number"].includes(typeof user)) return;
		let action = {
			action: "send_private_msg",
			group_id: group.toString(),
			user_id: user.toString(),
			message: msg,
		};
		if (opts.queue !== false) {
			this.actionQueue.add(action)
		} else {
			this.#reallySendAction(action)
		}
	}

	replyMessage(msg, content, opts = {}, cb) {
		if (msg instanceof QQMessage) { // 如果是原始对象
			if (msg.from === "group") {
				this.sendGroupMessage(msg.groupId, content, opts)
			} else {
				this.sendFriendMessage(msg.userId, content, opts)
			}
		} else if (msg.post_type) { // 有post_type说明是原始数据
			if (msg.group_id) {
				this.sendGroupMessage(msg.group_id, content, opts)
			} else {
				this.sendFriendMessage(msg.user_id, content, opts)
			}
		}
	}

	sendFriendMsg(...args) {
		this.sendFriendMessage(...args)
	}
	sendGroupMsg(...args) {
		this.sendGroupMessage(...args)
	}
	sendPrivateMsg(...args) {
		this.sendPrivateMessage(...args)
	}
	replyMsg(...args) {
		this.replyMessage(...args)
	}
}

PluginContext.prototype.napcat = {
	async send(action, params) {
		return (await client.tellNapcatPromise(action, params)).data || null;
	},
	listen(event, callback) {

	}
}

/*=== API --- onMessage ===*/
PluginContext.onMessageHandler = {
	regexp(regexp, callback, opts) {
		// 在chat实例上注册处理器
		let handler = new QQMessageTrigger(
			msg => { // 断言函数
				let text = "";
				if (msg.content[0]?.type === "at" && msg.content[0]?.data?.qq == NodecatConfig.bot_account) text = msg.toString(1).trim()
				else text = msg.text.trim()
				if (regexp.test(text)) return true;
				return false;
			},
			callback)
		// 将被废用
		this.registerQQMessageTrigger(handler);
		return handler.uuid;
	},
	full(full, callback, opts) {
		// 在chat实例上注册处理器
		let handler = new QQMessageTrigger(
			msg => { // 断言函数
				let text = "";
				if (msg.content[0]?.type === "at" && msg.content[0]?.data?.qq == NodecatConfig.bot_account) text = msg.toString(1).trim()
				else text = msg.text.trim()
				if (full === text) return true;
				return false;
			},
			callback);
		this.registerQQMessageTrigger(handler);
		return handler.uuid;
	},
	startsWith(startsWith, callback, opts) {
		// 在chat实例上注册处理器
		let handler = new QQMessageTrigger(
			msg => { // 断言函数
				let text = "";
				if (msg.content[0]?.type === "at" && msg.content[0]?.data?.qq == NodecatConfig.bot_account) text = msg.toString(1).trim()
				else text = msg.text.trim()
				if (text.startsWith(startsWith)) return true;
				return false;
			},
			callback);
		this.registerQQMessageTrigger(handler);
		return handler.uuid;
	},
	endsWith(endsWith, callback, opts) {
		// 在chat实例上注册处理器
		let handler = new QQMessageTrigger(
			msg => { // 断言函数
				let text = "";
				if (msg.content[0]?.type === "at" && msg.content[0]?.data?.qq == NodecatConfig.bot_account) text = msg.toString(1).trim()
				else text = msg.text.trim()
				if (text.endsWith(endsWith)) return true;
				return false;
			},
			callback);
		this.registerQQMessageTrigger(handler);
		return handler.uuid;
	},
	includes(includes, callback, opts) {
		// 在chat实例上注册处理器
		let handler = new QQMessageTrigger(
			msg => { // 断言函数
				let text = "";
				if (msg.content[0]?.type === "at" && msg.content[0]?.data?.qq == NodecatConfig.bot_account) text = msg.toString(1).trim()
				else text = msg.text.trim();
				if (text.includes(includes)) return true;
				return false;
			},
			callback);
		this.registerQQMessageTrigger(handler);
		return handler.uuid;
	},
	all(callback, opts) {
		// 在chat实例上注册处理器
		let handler = new QQMessageTrigger(
			() => { // 断言函数
				return true;
			},
			callback);
		this.registerQQMessageTrigger(handler);
		return handler.uuid;
	},
	custom(predicate, callback, opts) {
		// 在chat实例上注册处理器
		let handler = new QQMessageTrigger(
			predicate,
			callback);
		this.registerQQMessageTrigger(handler);
		return handler.uuid;
	}
}

/*=== API --- group ===*/
PluginContext.prototype.group = {
	exit(group, force = false) { // 退出群聊
		if (!["string", " number"].includes(typeof group)) return;
		return client.tellNapcatPromise("set_group_leave", {
			group_id: group.toString(),
			is_dismiss: opts.force
		})
	},
	kick(group, user, forever = false) {
		if (!["string", " number"].includes(typeof group)) return;
		if (!["string", " number"].includes(typeof user)) return;
		return client.tellNapcatPromise("set_group_kick", {
			group_id: group.toString(),
			user_id: user.toString(),
			reject_add_request: opts.forever
		})
	},
	setBan(group, user, duration = 30 * 60) {
		if (!["string", " number"].includes(typeof group)) return;
		if (!["string", " number"].includes(typeof user)) return;
		return client.tellNapcatPromise("set_group_kick", {
			group_id: group.toString(),
			user_id: user.toString(),
			duration: opts.duration
		})
	},
	setWholeBan(group, enable = false) {
		if (!["string", " number"].includes(typeof group)) return;
		return client.tellNapcatPromise("set_group_whole_ban", {
			group_id: group.toString(),
			enable: enable
		})
	},
	setAdmin(group, user, enable = true) {
		if (!["string", " number"].includes(typeof group)) return;
		if (!["string", " number"].includes(typeof user)) return;
		return client.tellNapcatPromise("set_group_admin", {
			group_id: group.toString(),
			user_id: user.toString(),
			enable: enable
		})
	}
}

module.exports = PluginContext;