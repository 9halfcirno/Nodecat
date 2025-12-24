const Chat = require("./qq_chat.js")
const onebot = require("../OneBot v11.js")
const QQMessage = require("./qq_message.js")
const client = require("./ws_client.js")
const PluginManager = require("./plugin_manager.js")

const Nodecat = {
	// 处理qq消息方法
	handleQQMessage(msg) {
		if (!(msg instanceof QQMessage)) msg = new QQMessage(msg)
		PluginManager.triggerQQMessage(msg)
	},
	handleQQNotice(data) {
		if (data.post_type !== onebot.EventType.NOTICE) return;
		PluginManager.triggerQQNotice(data)
	},
	handleQQMessageSent(msg) {
		if (!(msg instanceof QQMessage)) msg = new QQMessage(msg)
		PluginManager.triggerQQMessageSent(msg)
	}
}

/*
class Nodecat extends Chat {
	constructor() {
		super({
			type: "nodecat",
			id: "global"
		})
		
		this.QQGroups = new Map(); // QQ群组
		this.QQFriends = new Map(); // QQ好友
		
	}
	

	
	// 重写Chat默认的处理方法
	_handleQQMessage(msg) { // 处理消息QQMessage对象
		super._handleQQMessage(msg)
	}
	
	sendMessage(target, msg, opts) {
		if (target === this) return false;
		if (target instanceof QQ.Chat) target.sendMessage(msg, opts) // 转发发送请求
	}
	
	replyMessage(msg, reply) {
		if (msg instanceof QQMessage) {// 如果是原始对象
			if (msg.from === "group") {
				this.sendGroupMessage(msg.groupId, reply)
			} else {
				this.sendPrivateMessage(msg.userId, reply)
			}
		}
	}
	
	sendGroupMessage(group, msg, opts) {
		// 先凑合着用tellNapcat方法吧，不搞队列
		client.tellNapcat("send_group_msg", {
			group_id: group,
			message: msg
		})
	}
	
	sendPrivateMessage(id, msg , opts) {
		// 先凑合着用tellNapcat方法吧，不搞队列
		client.tellNapcat("send_msg", {
			user_id: id,
			message: msg
		})
	}
	
	// 返回Group实例
	getGroup(id) {}
	
	// 返回Friend实例
	getFriend(id) {}
}

let cat = new Nodecat();
*/
module.exports = Nodecat;