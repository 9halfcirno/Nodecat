const Chat = require("./qq_chat.js")
const client = require("./ws_client.js")
const util = require("./util.js")
const NodecatMessage = require("./nodecat_message.js")
const print = require("./print.js")

class QQGroup extends Chat {
	constructor(id) {
		if (typeof id !== "number") throw new Error(`QQGroup构造函数必须传入一个数字，而传入的是${id}`)
		super({
			type: "group",
			id: id
		});
		this.members = new Map();
	}
	
	// 真正发送消息的方法，不直接使用，而是作为队列处理方法
	_sendMessage(msg) { 
		let self = this;
		return new Promise((resolve, reject) => {
			client.tellNapcat("send_msg", {
				message_type: "group",
				group_id: self.id,
				message: msg.content,
				auto_escape: msg.autoEscape ? true : false
			}, data => {
				if (data.status === "failed") {
					// 显示错误原因
					print.error(`消息发送失败: ${data.message}`)
				}
				resolve(data); // 无论如何解决期约
			})
		})
	}

	_pushMessageToQueue(msg, opts) {
		this.messageQueue.add({
			content: msg,
			...opts
		})
	}
	
	// 直接发送消息，不排队
	sendMessageNow() {
		for (let i = 0, n = arguments.length; i < n; i++) {
			let msg = arguments[i]; // 获取消息
			if (msg instanceof NodecatMessage) {
				let content = msg.content; // 获取消息元素数组
				this._sendMessage(content, {autoEscape: false});
			} else {
				this._sendMessage(msg); // 这里不传递autoEscape参数，由onebot自己判断
			}
		};
	}
	
	// 按顺序发送消息，排队
	sendMessage() {
		/*
		 *	这里的msg有三种情况:
		 *		1.string/...(其他JSON原生支持值)
		 *		2.array
		 *		3.NodecatMessage实例
		 *	其中，1, 2情况中，onebot协议本身支持，所以只特殊处理NodecatMessage实例
		 */
		for (let i = 0, n = arguments.length; i < n; i++) {
			let msg = arguments[i]; // 获取消息
			if (msg instanceof NodecatMessage) {
				let content = msg.content; // 获取消息元素数组
				this._pushMessageToQueue(content, {autoEscape: false});
			} else {
				this._pushMessageToQueue(msg); // 这里不传递autoEscape参数，由onebot自己判断
			}
		};
	}
	
	// 更新群信息
	_updateGroupInfo() {}
	
	getMemberList() {}
	
	getAdminList() {}
	
	getOwner() {}
}