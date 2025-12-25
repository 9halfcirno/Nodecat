// TODO
const onebot = require("../OneBot v11.js")
const client = require("./ws_client.js")

class Request {
	constructor(data) {
		if (data.post_type !== onebot.EventType.REQUEST) {
			throw new Error("", data, "不是一个请求事件")
		}
		this.flag = data.flag || null;
		this.comment = data.comment || "";
		this.userId = data.user_id;
		this.from = data.request_type;
		if (this.from === "group") {
			this.type = data.sub_type;
		}
		this.handled = false;
	}

	agree() { // 同意该请求
		if (this.handled) return;
		if (this.from === "friend") {
			this.handled = true;
			return client.tellNapcatPromise("set_friend_add_request", {
				flag: this.flag,
				approve: true
			})
		} else {
			this.handled = true;
			return client.tellNapcatPromise("set_group_add_request", {
				flag: this.flag,
				approve: true,
				type: this.type
			})
		}
	}

	async reject(reason) {
		if (this.handled) return;
		if (this.from === "friend") {
			this.handled = true;
			return client.tellNapcatPromise("set_friend_add_request", {
				flag: this.flag,
				approve: false
			})
		} else {
			this.handled = true;
			return client.tellNapcatPromise("set_group_add_request", {
				flag: this.flag,
				approve: false,
				type: this.type,
				reason: reason
			})
		}
	}
}

module.exports = Request;