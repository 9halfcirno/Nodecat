import {
	parentPort
} from 'worker_threads';
import Bridge from "./onebot_bridge.js"
import MsgConstructor from "./qq/message_constructor.js"

const QQMessageSender = {
	send(msg, opts = {}) {
		if (msg instanceof MsgConstructor) msg = msg.content;
		if (opts.group) {
			if (opts.user) { // 私聊
				return Bridge.send("send_msg", {
					group_id: opts.group,
					user_id: opts.user,
					message: msg
				})
			} else { // 群聊
				return Bridge.send("send_group_msg", {
					group_id: opts.group,
					message: msg
				})
			}
		} else { // 好友
			return Bridge.send("send_private_msg", {
				user_id: opts.user,
				message: msg
			})
		}
	}
}

parentPort?.on("message", msg => {
	if (msg.cmd === "onebot:send_msg") {
		QQMessageSender.send(msg.content, {
			group: msg.group,
			user: msg.user
		})
	}
})

export default QQMessageSender;