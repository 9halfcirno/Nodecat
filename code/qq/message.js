import OneBotBridge from "../onebot_bridge.js"
import QQMsgSender from "../qq_message_sender.js"
import Permission from "../permission_system.js"

/**
 * 解析 CQ 码字符串为 OneBot v11 array 消息格式
 * @param {string} cqText
 * @returns {Array<{type: string, data: Object}>}
 */
function parseCQToOneBotArray(cqText) {
	const result = []
	if (!cqText) return result

	// 匹配 CQ 码
	const cqRegex = /\[CQ:([a-zA-Z0-9_-]+)((?:,[^,\]=]+=[^,\]]*)*)\]/g

	let lastIndex = 0
	let match

	while ((match = cqRegex.exec(cqText)) !== null) {
		const index = match.index

		// 前面的纯文本
		if (index > lastIndex) {
			result.push({
				type: "text",
				data: {
					text: cqText.slice(lastIndex, index)
				}
			})
		}

		const type = match[1]
		const paramsStr = match[2]
		const data = {}

		if (paramsStr) {
			const params = paramsStr.slice(1).split(",")
			for (const p of params) {
				const eqIndex = p.indexOf("=")
				if (eqIndex !== -1) {
					const key = p.slice(0, eqIndex)
					const value = p.slice(eqIndex + 1)
					data[key] = unescapeCQ(value)
				}
			}
		}

		result.push({
			type,
			data
		})

		lastIndex = cqRegex.lastIndex
	}

	// 末尾文本
	if (lastIndex < cqText.length) {
		result.push({
			type: "text",
			data: {
				text: cqText.slice(lastIndex)
			}
		})
	}

	return result
}

/**
 * 反转义 CQ 特殊字符
 */
function unescapeCQ(text) {
	return text
		.replace(/&#91;/g, "[")
		.replace(/&#93;/g, "]")
		.replace(/&#44;/g, ",")
		.replace(/&amp;/g, "&")
}

class QQMessage {
	/**
	 * @param {Object | String} 消息的原始数据
	 */
	constructor(data) {
		this.data = data;
		this.time = data.time * 1000; // 转换为毫秒
		this.id = data.message_id;

		// 消息来源，为 group 或 private
		this.from = data.message_type;

		// 消息内容
		this.rawText = data.raw_message;
		if (data.message_format === "array") this.content = data.message;
		else this.content = parseCQToOneBotArray(data.message);

		// 发送者
		let role = Permission.permissionOf(data.sender.user_id);
		this.sender = {
			id: data.sender.user_id,
			nickname: data.sender.nickname,
			card: data.sender.card,
			role: role !== "member" ? role : data.sender.role,
			title: data.sender.title,
			level: data.sender.level
		};

		// 来自群聊(如果有)
		if (this.from === "group")
			this.group = {
				id: data.group_id,
				name: data.group_name
			}
	}

	reply(msg) {
		QQMsgSender.send(msg, {
			group: this.group?.id,
			user: this.sender.id
		})
	}

	async getDetailedString(from = 0) {
		let text = '';
		for (const block of this.content) {
			if (this.content.indexOf(block) < from) continue;
			if (block.type === QQMessage.BlockType.AT) {
				let user;
				if (block.data.qq === "all") {
					text += "@全体成员";
					continue;
				}
				if (this.from === "group") {
					try {
						user = await OneBotBridge.send("get_group_member_info", {
							group_id: this.groupId,
							user_id: block.data.qq
						})
					} catch (e) {
						user = await OneBotBridge.send("get_stranger_info", {
							user_id: block.data.qq
						})
					}
				} else {
					user = await OneBotBridge.send("get_stranger_info", {
						user_id: block.data.qq
					})
				}
				text += `@${user.card || user.nickname}`;
			} else if (block.type === QQMessage.BlockType.REPLY) {
				try {
					const msg = await OneBotBridge.send("get_msg", {
						message_id: block.data.id
					})
					text += `[引用:${new QQMessage(msg).toString()}]\n`;
				} catch (e) {
					text += "[回复]";
					console.log(e);

				}
			} else if (block.type === "text") {
				text += block.data.text;
			} else {
				text += `[${QQMessage.BlockDisplay[block.type] || block.type}]`
			}
		}
		return text;
	}

	toString(from = 0) {
		let text = '';
		for (const block of this.content) {
			if (this.content.indexOf(block) < from) continue;
			if (block.type === "text") {
				text += block.data.text;
			} else {
				text += `[${QQMessage.BlockDisplay[block.type] || block.type}]`
			}
		}
		return text;
	}
	
	/**
	 * 将消息转为开头不包含回复和@ME的一般字符串
	 */
	toNormalString() {
		let i = 0;
		for (i = 0; i < this.content.length; i++) {
			if (this.content[i].type === "reply") continue;
			if (this.content[i].type === "at" && this.content[i].data?.qq == this.data.self_id) continue;
			break;
		};
		return this.toString(i).trim();
	}
}



QQMessage.BlockType = {
	TEXT: "text",
	AT: "at",
	FACE: "face",
	DICE: "dice",
	RPS: "rps",
	REPLY: "reply",
	IMAGE: "image",
	SHARE: "share",
	XML: "xml",
	JSON: "json",
	POKE: "poke",
	RECORD: "record",
	VIDEO: "video",
	FORWARD: "forward",
	FILE: "file",
	MARKDOWN: "markdown"
}
QQMessage.BlockDisplay = {
	text: "文本",
	at: "艾特",
	face: "表情",
	dice: "骰子",
	rps: "剪刀石头布",
	reply: "回复",
	image: "图片",
	share: "分享",
	xml: "XML消息",
	json: "JSON消息",
	poke: "戳一戳",
	record: "语音",
	video: "视频",
	forward: "合并转发",
	file: "文件",
	markdown: "Markdown"
}


// console.log(new QQMessage({
// "self_id": 3839788105,
// "user_id": 318118620,
// "time": 1763817348,
// "message_id": 730342765,
// "message_seq": 730342765,
// "real_id": 730342765,
// "real_seq": "308447",
// "message_type": "group",
// "sender": {
// "user_id": 318118620,
// "nickname": "酒中碎月,花下萃香",
// "card": "时不时做梦爱你",
// "role": "admin"
// },
// "raw_message": "[CQ:image,file=956FEE3B1830729D70141FAE2E01262B.jpg,sub_type=0,url=https://multimedia.nt.qq.com.cn/download?appid=1407&amp;fileid=EhRG8FRT_LMzArPpFQ8RWUFxxme_5BieuAsg_woo94Gv0-uFkQMyBHByb2RQgL2jAVoQG3OYLRxScQpq7fmCyJJ2nnoCmGeCAQJuag&amp;rkey=CAESMEbNIKqz0R_C42CrbBkCD75MR3DE7XZc42DYDRRP5UMenDyngrdOiWOSgcg_J4izDw,file_size=187422]",
// "font": 14,
// "sub_type": "normal",
// "message": [{
// "type": "image",
// "data": {
// "summary": "",
// "file": "956FEE3B1830729D70141FAE2E01262B.jpg",
// "sub_type": 0,
// "url": "https://multimedia.nt.qq.com.cn/download?appid=1407&fileid=EhRG8FRT_LMzArPpFQ8RWUFxxme_5BieuAsg_woo94Gv0-uFkQMyBHByb2RQgL2jAVoQG3OYLRxScQpq7fmCyJJ2nnoCmGeCAQJuag&rkey=CAESMEbNIKqz0R_C42CrbBkCD75MR3DE7XZc42DYDRRP5UMenDyngrdOiWOSgcg_J4izDw",
// "file_size": "187422"
// }
// }],
// "message_format": "array",
// "post_type": "message",
// "group_id": 575105611,
// "group_name": "白玉楼聊天室"
// }))

export default QQMessage