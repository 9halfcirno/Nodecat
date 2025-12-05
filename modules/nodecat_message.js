class NodecatMessage {
	constructor(str) {
		this.content = [];
	}

	text(...args) {
		for (let t of ...args) {
			this.content.push({
				type: "text",
				data: {
					"text": t.toString()
				}
			})
		}
		return this;
	}
	
	image() {}
}
// nodecat格式化消息用
NodecatMessage.formatMessageRegexp = /\[(\S+)\:([\s\S]*?_)\]/;