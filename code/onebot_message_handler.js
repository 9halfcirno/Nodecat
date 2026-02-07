import onebotV11 from "./onebot v11.js";
import QQMessage from "./qq/message.js";
import Bridge from "./onebot_bridge.js";

class OneBotMessageHandler {
	constructor() {
		this.messageHandlers = [];
		this.noticeHandlers = [];
		this.requestHandlers = [];
		this.metaHandlers = [];
		this.messageSentHandlers = [];

		Bridge.onMessage((json) => {
			this._receiveMessage(json);
		});
	}

	// 在这里处理从各个通信方式收到的消息
	_receiveMessage(json) {
		if (!json.post_type) return;
		
		if (typeof json === 'string') json = JSON.parse(json); // 如果未解析则解析
		switch (json.post_type) {
			case onebotV11.EventType.MESSAGE:
				this._handleMessage(new QQMessage(json));
				break;
			case onebotV11.EventType.REQUEST:
				this._handleRequest(json);
				break;
			case onebotV11.EventType.NOTICE:
				this._handleNotice(json);
				break;
			case onebotV11.EventType.META:
				this._handleMeta(json);
				break;
			case onebotV11.EventType.MESSAGE_SENT:
				this._handleMessageSent(new QQMessage(json));
				break;
			default:
				console.warn(`收到未知的post_type: ${json.post_type}`, json);
		}
	}

	_handleMessage(message) {
		// 调用所有注册的消息处理器
		for (const handler of this.messageHandlers) {
			try {
				handler(message);
			} catch (error) {
				console.error('消息处理器出错:', error);
			}
		}
	}

	_handleNotice(notice) {
		// 调用所有注册的通知处理器
		for (const handler of this.noticeHandlers) {
			try {
				handler(notice);
			} catch (error) {
				console.error('通知处理器出错:', error);
			}
		}
	}

	_handleRequest(request) {
		// 调用所有注册的请求处理器
		for (const handler of this.requestHandlers) {
			try {
				handler(request);
			} catch (error) {
				console.error('请求处理器出错:', error);
			}
		}
	}

	_handleMeta(meta) {
		// 调用所有注册的元事件处理器
		for (const handler of this.metaHandlers) {
			try {
				handler(meta);
			} catch (error) {
				console.error('元事件处理器出错:', error);
			}
		}
	}

	_handleMessageSent(messageSent) {
		// 调用所有注册的消息发送事件处理器
		for (const handler of this.messageSentHandlers) {
			try {
				handler(messageSent);
			} catch (error) {
				console.error('消息发送事件处理器出错:', error);
			}
		}
	}

	// 注册消息处理器
	onMessage(cb) {
		if (typeof cb === 'function') {
			this.messageHandlers.push(cb);
		}
		return this; // 支持链式调用
	}

	// 注册通知处理器
	onNotice(cb) {
		if (typeof cb === 'function') {
			this.noticeHandlers.push(cb);
		}
		return this;
	}

	// 注册请求处理器
	onRequest(cb) {
		if (typeof cb === 'function') {
			this.requestHandlers.push(cb);
		}
		return this;
	}

	// 注册元事件处理器
	onMeta(cb) {
		if (typeof cb === 'function') {
			this.metaHandlers.push(cb);
		}
		return this;
	}

	// 注册消息发送事件处理器
	onMessageSent(cb) {
		if (typeof cb === 'function') {
			this.messageSentHandlers.push(cb);
		}
		return this;
	}

	// 移除消息处理器
	offMessage(cb) {
		const index = this.messageHandlers.indexOf(cb);
		if (index !== -1) {
			this.messageHandlers.splice(index, 1);
		}
		return this;
	}

	// 移除通知处理器
	offNotice(cb) {
		const index = this.noticeHandlers.indexOf(cb);
		if (index !== -1) {
			this.noticeHandlers.splice(index, 1);
		}
		return this;
	}

	// 移除请求处理器
	offRequest(cb) {
		const index = this.requestHandlers.indexOf(cb);
		if (index !== -1) {
			this.requestHandlers.splice(index, 1);
		}
		return this;
	}

	// 移除元事件处理器
	offMeta(cb) {
		const index = this.metaHandlers.indexOf(cb);
		if (index !== -1) {
			this.metaHandlers.splice(index, 1);
		}
		return this;
	}

	// 移除消息发送事件处理器
	offMessageSent(cb) {
		const index = this.messageSentHandlers.indexOf(cb);
		if (index !== -1) {
			this.messageSentHandlers.splice(index, 1);
		}
		return this;
	}

	// 清空所有消息处理器
	clearMessageHandlers() {
		this.messageHandlers = [];
		return this;
	}

	// 清空所有通知处理器
	clearNoticeHandlers() {
		this.noticeHandlers = [];
		return this;
	}

	// 清空所有请求处理器
	clearRequestHandlers() {
		this.requestHandlers = [];
		return this;
	}

	// 清空所有元事件处理器
	clearMetaHandlers() {
		this.metaHandlers = [];
		return this;
	}

	// 清空所有消息发送事件处理器
	clearMessageSentHandlers() {
		this.messageSentHandlers = [];
		return this;
	}

	// 一次性注册所有类型的事件处理器
	onAll(callbacks) {
		if (callbacks.message) this.onMessage(callbacks.message);
		if (callbacks.notice) this.onNotice(callbacks.notice);
		if (callbacks.request) this.onRequest(callbacks.request);
		if (callbacks.meta) this.onMeta(callbacks.meta);
		if (callbacks.messageSent) this.onMessageSent(callbacks.messageSent);
		return this;
	}
}

export default OneBotMessageHandler;