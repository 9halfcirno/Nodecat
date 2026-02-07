import Bridge from "./onebot_bridge.js"

const QQMessageSender = {
	async send(msg, opts = {}) {
		if (opts.group) {
			if (opts.user) { // 私聊
				return await Bridge.send("send_msg", {
					group_id: opts.group,
					user_id: opts.user,
					message: msg
				})
			} else { // 群聊
				return await Bridge.send("send_group_msg", {
					group_id: opts.group,
					message: msg
				})
			}
		} else { // 好友
			return await Bridge.send("send_private_msg", {
				user_id: opts.user,
				message: msg
			})
		}
	}
}

export default QQMessageSender;