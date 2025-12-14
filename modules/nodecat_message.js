class NodecatMessage {
	constructor(str) { // nodecat的message格式是解析字符串式的
		this.content = NodecatMessage.parse(str);
	}

	/*text(...args) {
		for (let t of ...args) {
			this.content.push({
				type: "text",
				data: {
					"text": t.toString()
				}
			})
		}
		return this;
	}*/

	image() {}

	static formatMessageRegexp = /\[([a-zA-Z0-9_]+):([^\]]+)\]/g;
	/**
	 * 解析 Nodecat 消息为 OneBot V11 消息段数组
	 */
	static parse(str) {
		if (typeof str !== "string") str = str.toString();

		let result = [];
		let lastIndex = 0;
		let match;

		while ((match = NodecatMessage.formatMessageRegexp.exec(str)) !== null) {
			const full = match[0];
			const type = match[1];
			const body = match[2];

			// 添加前面的文本
			if (match.index > lastIndex) {
				result.push({
					type: "text",
					data: {
						text: str.slice(lastIndex, match.index)
					}
				});
			}

			// 解析参数
			let data = {};
			body.split(",").forEach(pair => {
				let [k, v] = pair.split("=");
				if (k) data[k] = v ?? "";
			});

			// ---- 扩展特殊类型转换 ----

			switch (type) {
				case "at":
					// [at:qq=xxx]
					result.push({
						type: "at",
						data: {
							qq: data.qq
						}
					});
					break;
				case "image":
					result.push({
						type: "image",
						data
					});
					break;
				case "record":
					result.push({
						type: "record",
						data
					});
					break;
				case "video":
					result.push({
						type: "video",
						data
					});
					break;
				case "file":
					result.push({
						type: "file",
						data
					});
					break;
				case "face":
					result.push({
						type: "face",
						data: {
							id: data.id
						}
					});
					break;
				case "xml":
					result.push({
						type: "xml",
						data: {
							data: data.data
						}
					});
					break;
				case "json":
					result.push({
						type: "json",
						data: {
							data: data.data
						}
					});
					break;
				default:
					// 未知消息段 → 按 OneBot 自定义段处理
					result.push({
						type,
						data
					});
					break;
			}

			// 移动索引
			lastIndex = match.index + full.length;
		}

		// 剩余文本
		if (lastIndex < str.length) {
			result.push({
				type: "text",
				data: {
					text: str.slice(lastIndex)
				}
			});
		}

		return result;
	}

}
// nodecat格式化消息用
NodecatMessage.formatMessageRegexp = /\[(\S+)\:([\s\S]*?_)\]/;

let a = new NodecatMessage("aaa[image:url=https://example.com/image,name=123,sender=1+1=9,time=1784848484]bbb[at:qq=111222333]")