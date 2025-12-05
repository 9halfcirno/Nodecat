const client = require("./ws_client.js")
const print = require("./print.js")
const util = require("./util.js")
const onebot = require("../OneBot v11.js")
const nodecat = require("./nodecat.js")

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
		nodecat.handleQQMessage(data)
	},
	messageSent(data) {
	}
}