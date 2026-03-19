import onebotV11 from "../onebot v11.js"
import Bridge from "../onebot_bridge.js"

class QQRequest {
	constructor(data) {
		if (data.post_type !== onebotV11.EventType.REQUEST) {
			throw new Error("", data, "不是一个请求事件")
		}
		this.time = data.time || 0;
		this.flag = data.flag || null;
		this.comment = data.comment || "";
		this.sender = {
			id: data.user_id
		};
		this.from = data.request_type;
		if (this.from === "group") {
			this.type = data.sub_type;
			this.group = {
				id: data.group_id
			}
		};

		this.handled = false;
	}

	agree() { // 同意该请求
		if (this.handled) return;
		if (this.from === "friend") {
			this.handled = true;
			return Bridge.send("set_friend_add_request", {
				flag: this.flag,
				approve: true
			})
		} else {
			this.handled = true;
			return Bridge.send("set_group_add_request", {
				flag: this.flag,
				approve: true,
				type: this.type
			})
		}
	}

	reject(reason) {
		if (this.handled) return;
		if (this.from === "friend") {
			this.handled = true;
			return Bridge.send("set_friend_add_request", {
				flag: this.flag,
				approve: false
			})
		} else {
			this.handled = true;
			return Bridge.send("set_group_add_request", {
				flag: this.flag,
				approve: false,
				type: this.type,
				reason: reason
			})
		}
	}
}

export default QQRequest;