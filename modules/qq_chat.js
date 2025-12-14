const path = require("path")
const onebot = require("../OneBot v11.js")
const DataMap = require("./data_map.js")
const Queue = require("./queue.js")
const client = require("./ws_client.js")
const util = require("./util.js")
const QQMessage = require("./qq_message.js")

class Chat {
	constructor(args) {
		this.type = args.type; // 类型: 私聊 群聊 'nodecat'
		this.id = args.id; // id: qq号 群号 'global'

		if (this.type === "nodecat") this.DataMap = new DataMap(`${process.cwd()}/storage/data/nodecat.json`)
		else this.DataMap = new DataMap(`${process.cwd()}/storage/data/${this.type}s/${this.id}.json`)

		// 消息处理器
		this.messageHandlers = new Map(); // uuid: handler

		// 消息发送队列，以便按顺序发送消息
		this.messageSendQueue = new Queue([], this._sendMessage)
	}

	// 真正发送消息的方法，应当返回一个期约
	_sendMessage() {
		return;
	}

	// 把消息推入队列
	_pushMessageToQueue() {
		// 子类自己实现
	}

	// 给用户调用的发送消息的方法
	sendMessage() {
		throw new Error("必须实现自己的发送消息方法")
	}

	sendAction() {
		throw new Error("必须定义自己的发送action方法")
	}

	// 在Chat实例上注册消息处理器
	_registerMessageHandler(handler) {
		if (handler instanceof QQMessageHandler) {
			// 设置处理器映射
			this.messageHandlers.set(handler.uuid, handler)
		} else {
			// ？
		}
	}

	handleQQMessage(msg) { // 处理QQ消息
		// 直接传入QQMessage的情况
		if (msg instanceof QQMessage) {
			//
		} else if (typeof msg === "object") { // 传入原始data的情况
			msg = new QQMessage(msg)
		} else { // 传入其他值的情况
			msg = QQMessage.fromString(msg.toString())
		}
		this._handleQQMessage(msg) // 进入处理
	}

	_handleQQMessage(msg) { // 处理消息QQMessage对象
		this.messageHandlers.forEach(handler => {
			handler.test(msg); // 触发消息
		})
	}

	//消息触发器
	get onMessage() { // 返回Chat上预定义的处理器类型
		let self = this;
		if (!this.onMessageProxy) { // 缓存代理对象
			this.onMessageProxy = new Proxy({}, { // 代理对象，减少代码重复，方便维护
				get(obj, key) { // onMessage.xxx是获取后调用，所以是get
					if (key in Chat.onMessageHandler) {
						return (...args) => { // 返回一个函数
							Chat.onMessageHandler[key].call(self, ...args)
						}
					} else return () => {};
				}
			})
		}
		return this.onMessageProxy;
	}

	// 注销消息触发器
	offMessage(uuid) {
		if (this.messageHandlers.has(uuid)) {
			// 移除消息触发器
			this.messageHandlers.delete(uuid)
		}
	}
	
	// 当触发某一事件/通知
	onAction() {}
	
	// 注销
	offAction() {}
}

module.exports = Chat