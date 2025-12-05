const print = require("./print.js")
const util = require("./util.js")
const onebot = require("../OneBot v11.js")

/* Napcat的WS服务器的对应客户端*/
const NapcatWebSocketClient = {
	OPEN: 2,
	CLOSED: 0,
	CONNECTING: 1,
	ws: null,
	status: 0, // 0: 未连接, 1: 正在连接, 2: 已经连接
	connect(url, token, cb) {
		this.status = this.CONNECTING;
		this.ws = new WebSocket(url, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})

		let ws = this.ws;
		ws.onopen = () => {
			ws.onopen = null; // 清理事件处理器
			ws.onmessage = e => {
				ws.onmessage = null; // 同样清理
				let data = util.parseJSON(e.data)
				if (!data) {
					print.error(`[NapcatWebSocketClient.connect] 无法解析WS消息: ${e.data}`);
					cb?.(new Error("无法解析WS消息"));
				}
				if (data.status === "failed") {
					print.warn("WS连接失败: " + data.message)
					this.status = NapcatWebSocketClient.CLOSED;
					cb && cb(new Error(data.message))
				} else if (data.post_type === "meta_event" &&
					data.meta_event_type === "lifecycle" &&
					data.sub_type === "connect"
				) {
					print.log("已成功与WS服务器建立连接");
					print.log("开始监听消息");
					this.status = NapcatWebSocketClient.OPEN;
					cb && cb(null, ws);
					// 注册一个处理器，用于解决tellNapcat的回调
					ws.addEventListener("message", e => {
						let data = util.parseJSON(e.data);
						let map = NapcatWebSocketClient.wsSendMessageCallbacks;
						// 如果有echo
						if (data.echo && map.has(data.echo)) {
							let cb = map.get(data.echo)
							if (data.status === "ok") {
								cb(data)
							} else {
								cb(data); // 直接把失败传给cb
							}
						}
					})
					// 注册一个处理器，用于解决wsMessageHandler的处理器
					ws.addEventListener("message", e => {
						let data = util.parseJSON(e.data);
						if (data.post_type && Object.values(onebot.EventType).includes(data.post_type)) {
							NapcatWebSocketClient.wsMessageHandlers.forEach(h => {
								h(data)
							})
						}
					})
				}
			}
		}

		ws.onerror = e => {
			print.error("WS连接出现错误: " + e.message)
			print.error("将在5s内重试...")
			this.status = NapcatWebSocketClient.CLOSED;
			cb && cb(e)
		}

		ws.onclose = () => {
			print.error("与WS服务器断开连接，将在5s内重试...")
			this.status = NapcatWebSocketClient.CLOSED;
			setTimeout(() => {NapcatWebSocketClient.connect(url, token)}, 5000);
		}
	},
	wsSendMessageCallbacks: new Map(),
	tellNapcat(action, params, cb) { // 回调函数版本，期约由其他对象包装
		//if (params.group_id && params.group_id !== 819054228) return Promise.resolve();
		if (this.status !== this.OPEN) { // 不可通信时，打印消息
			print.error(`[WebSocketClient.tellNapcat] 当前无法与WS服务器通信，Client状态码: ${this.status}`)
			cb && cb(new Error(`当前无法与WS服务器通信，Client状态码: ${this.status}`))
		};
		let echo = util.uEcho(); // 唯一uid
		// 保存callback
		if (cb) this.wsSendMessageCallbacks.set(echo, cb)
		this.ws.send(JSON.stringify({
			action,
			params,
			echo
		}))
	},
	wsMessageHandlers: [],
	// 注册ws的onmessage处理器，除了请求响应消息，都经处理器
	// 这里注册的事件处理器不会因为重连而丢失
	registerWSMessageHandler(handler) {
		if (handler) {
			this.wsMessageHandlers.push(handler);
		}
	},
	unregisterWSMessageHandler(handler) {
		if (handler) {
			let index = this.wsMessageHandlers.indexOf(handler)
			if (index > -1) this.wsMessageHandlers.splice(index, 1);
		}
	}
}

//require("./ws_message_handler.js")

/*let client = NapcatWebSocketClient;

// 在这里处理ws消息
client.registerWSMessageHandler(data => {
	switch (data.post_type) {
		case onebot.EventType.META:
			wsMessageHandler.meta(data);
			break;
		case onebot.EventType.NOTICE:
			wsMessageHandler.notice(data);
			break;
		case onebot.EventType.MESSAGE:
			wsMessageHandler.message(data);
			break;
		case onebot.EventType.MESSAGE_SENT:
			wsMessageHandler.messageSent(data);
			break;
		default:
			print.warn(`未知的事件类型: ${data.post_type}`);
			break;
	}
})

const wsMessageHandler = {
	meta(data) {
		if (data.meta_event_type === onebot.MetaEventType.HEARTBEAT) {
			if (data.status.good) {
				print.log("[\033[34m心跳\033[0m] 心跳成功 间隔: " + data.interval + "ms 在线: " + data.status.online)
			} else {
				print.warn("[\033[34m心跳\033[0m] 心跳失败 间隔: " + data.interval + "ms 在线: " + data.status.online)
			}
		} else if (data.meta_event_type === onebot.MetaEventType.LIFECYCLE) {
			print.log("[\033[34m生命周期\033[0m] " + data.sub_type)
		}
	},
	notice(data) {
		if (data.notice_type === "notify" && data.sub_type === "poke") {
			if (data.user_id === 3839788105) return;
			if (data.target_id === 3839788105) {
				if (data.group_id)
					client.tellNapcat("send_poke", {
						group_id: data.group_id,
						user_id: data.user_id
					})
				else
					client.tellNapcat("send_poke", {
						user_id: data.user_id
					}, data => {
						print.log(data)
					})
			}
		};
	},
	message(data) {
		//console.log(onebot.QQMessageType[data.message_type])
		if (data.message_type === onebot.QQMessageType.GROUP || data.message_type === onebot.QQMessageType.PRIVATE) {
			let msg = new qq.QQMessage(data)
			print.log(msg.toString())
			Nodecat.handleQQMessage(msg)
		}
		// 控制台打印
		// TODO
	},
	messageSent(data) {
	}
}*/

module.exports = NapcatWebSocketClient;