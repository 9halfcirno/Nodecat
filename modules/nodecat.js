//废案const Chat = require("./qq_chat.js")
const onebot = require("../OneBot v11.js")
const QQMessage = require("./qq_message.js")
const QQRequest = require("./qq_request.js")
const client = require("./ws_client.js")
const PluginManager = require("./plugin_manager.js")
// todo const blacklist = require("./black_list.js")

/*=== 欢迎~这里是Nodecat分发消息的地方 */

const Nodecat = {
	// 处理qq消息方法
	handleQQMessage(msg) {
		if (msg.post_type !== onebot.EventType.MESSAGE) return;
		//if (isBlack(msg.user_id || msg.userId)) return;
		if (!(msg instanceof QQMessage)) msg = new QQMessage(msg)
		PluginManager.triggerQQMessage(msg)
	},
	handleQQNotice(data) {
		if (data.post_type !== onebot.EventType.NOTICE) return;
		//if (isBlack(data.user_id)) return;
		PluginManager.triggerQQNotice(data)
	},
	handleQQRequest(request) {
		if (request.post_type !== onebot.EventType.REQUEST) return;
		//if (isBlack(request.user_id || request.userId)) return;
		if (!(request instanceof QQRequest)) request = new QQRequest(request)
		PluginManager.triggerQQRequest(request)
	},
	handleQQMessageSent(msg) {
		if (!(msg instanceof QQMessage)) msg = new QQMessage(msg)
		PluginManager.triggerQQMessageSent(msg)
	}
}

/*function isBlack(id) {
	return blacklist.has(id);
}*/

module.exports = Nodecat;