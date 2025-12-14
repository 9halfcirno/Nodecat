const DataMap = require("./data_map.js")
const path = require("path")
const QQMessage = require("./qq_message.js")
const Queue = require("./queue.js")
//const ChatList = require("./chat_list.js")
const util = require("./util.js")
const client = require("./ws_client.js")

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

class PluginContext { // 插件注册上下文
	constructor(id) {
		this.id = id;
		this.messageTriggers = new Map(); // 自己的触发器
		this.noticeTriggers = []; // 自己的触发器
		// 插件数据存储
		this.dataMap = new DataMap(path.join(NodecatConfig.nodecat_run_path, "storage/data/plugins/", `${id}.json`))

		// 待发送消息
		this.messageSendQueue = new Queue([], this.#reallySendMessage)

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

	registerQQMessageTrigger(trigger) {
		this.messageTriggers.set(trigger.uuid, trigger)
	}

	// 触发消息
	triggerQQMessage(msg) {
		// 遍历自己的消息处理器列表
		this.messageTriggers.forEach(t => {
			t.test(msg);
		})
	}

	triggerQQNotice(notice) {
		// 
	}

	get data() {
		return this.dataMap
	}
	
	get path() {
		return {
			storage: path.resolve(NodecatConfig.nodecat_run_path, "storage")
		}
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
					} else return () => {};
				}
			})
		}
		return this.onMessageProxy;
	}

	sendGroupMessage(group, msg, opts = {}) {
		// 目前发送string消息
		let m = {
			to: "group",
			group_id: group,
			content: msg
		}
		if (opts.queue !== false) {
			this.messageSendQueue.add(m)
		} else {
			this.#reallySendMessage(m)
		}
	}

	sendFriendMessage(friend, msg, opts = {}) {
		// 目前发送string消息
		let m = {
			to: "friend",
			user_id: friend,
			content: msg
		}
		if (opts.queue !== false) {
			this.messageSendQueue.add(m)
		} else {
			this.#reallySendMessage(m)
		}
	}

	sendPrivateMessage(group, user, msg, opts = {}) {
		// 目前发送string消息
		let m = {
			to: "private",
			group_id: group,
			user_id: user,
			content: msg
		}
		if (opts.queue !== false) {
			this.messageSendQueue.add(m)
		} else {
			this.#reallySendMessage(m)
		}
	}

	replyMessage(msg, content, opts) {
		if (msg instanceof QQMessage) { // 如果是原始对象
			if (msg.from === "group") {
				this.sendGroupMessage(msg.groupId, content, opts)
			} else {
				this.sendFriendMessage(msg.userId, content, opts)
			}
		}
	}
}

/*=== API --- onMessage ===*/
PluginContext.onMessageHandler = {
	regexp(regexp, callback, opts) {
		// 在chat实例上注册处理器
		let handler = new QQMessageTrigger(
			msg => { // 断言函数
				let text = msg.text; // 获取文本内容
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
				let text = msg.text; // 获取文本内容
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
				let text = msg.text; // 获取文本内容
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
				let text = msg.text; // 获取文本内容
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
				let text = msg.text; // 获取文本内容
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

module.exports = PluginContext;