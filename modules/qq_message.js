const client = require("./ws_client.js")

class QQMessage {
	constructor(data) { // 从napcat获取到的data
		this.rawData = data; // 原始json
		this.id = data.message_id; // 消息id
		this.rawText = data.raw_message; // cq文本
		this.content = data.message; // 内容
		this.contentFormat = data.message_format; // 内容类型
		this.from = data.message_type; // 来自

		this.groupId = data.group_id; // 群id
		this.userId = data.user_id; // 发送者id
	}

	get text() {
		return this.toString()
	}

	toString(start = 0) {
		if (this.contentFormat) {
			let msg = "";
			for (let i = start, n = this.content.length; i < n; i++) {
				let block = this.content[i];
				if (block.type === "text") {
					msg += block.data.text; // 累加文本
					continue; // 下一块
				}
				if (QQMessage.MessageType[block.type]) {
					msg += `[${QQMessage.MessageType[block.type]}]`;
					continue; // 下一块
				}
			};
			return msg;
		}
	}

	getSender(opts = {}) {
		if (opts.detail) { // 详细的话就返回期约
			let self = this;
			return new Promise((resolve, reject) => {
				if (this.from === "group") { // 来自群，获取群成员信息
					client.tellNapcat("get_group_member_info", {
						group_id: self.groupId,
						user_id: self.userId
					}, (err, data) => {
						if (err) reject(err); // 有错误就拒绝，failed也是
						else if (data.status === "failed") reject(data);
						else resolve(data.data) // 以data解决
					})
				} else {
					resolve(this.rawData.sender);// 以sender对象解决
				}
			})
		} else { // 否则直接返回sender
			return this.rawData.sender;
		}
	}

	getChat() {
		
	}

	static fromString(str) {
		return new QQMessage({
			message_id: null,
			raw_message: str,
			message: [{
				type: "text",
				data: {
					text: str
				}
			}],
			message_format: "array",
			message_type: "private"
		})
	}
}

QQMessage.MessageType = {
	text: "文本",
	image: "图片",
	record: "语音",
	video: "视频",
	file: "文件",
	reply: "回复",
	face: "表情",
	at: "艾特"
}
/*
{
	"self_id": 3839788105,
	"user_id": 318118620,
	"time": 1763817348,
	"message_id": 730342765,
	"message_seq": 730342765,
	"real_id": 730342765,
	"real_seq": "308447",
	"message_type": "group",
	"sender": {
		"user_id": 318118620,
		"nickname": "酒中碎月,花下萃香",
		"card": "时不时做梦爱你",
		"role": "admin"
	},
	"raw_message": "[CQ:image,file=956FEE3B1830729D70141FAE2E01262B.jpg,sub_type=0,url=https://multimedia.nt.qq.com.cn/download?appid=1407&amp;fileid=EhRG8FRT_LMzArPpFQ8RWUFxxme_5BieuAsg_woo94Gv0-uFkQMyBHByb2RQgL2jAVoQG3OYLRxScQpq7fmCyJJ2nnoCmGeCAQJuag&amp;rkey=CAESMEbNIKqz0R_C42CrbBkCD75MR3DE7XZc42DYDRRP5UMenDyngrdOiWOSgcg_J4izDw,file_size=187422]",
	"font": 14,
	"sub_type": "normal",
	"message": [{
		"type": "image",
		"data": {
			"summary": "",
			"file": "956FEE3B1830729D70141FAE2E01262B.jpg",
			"sub_type": 0,
			"url": "https://multimedia.nt.qq.com.cn/download?appid=1407&fileid=EhRG8FRT_LMzArPpFQ8RWUFxxme_5BieuAsg_woo94Gv0-uFkQMyBHByb2RQgL2jAVoQG3OYLRxScQpq7fmCyJJ2nnoCmGeCAQJuag&rkey=CAESMEbNIKqz0R_C42CrbBkCD75MR3DE7XZc42DYDRRP5UMenDyngrdOiWOSgcg_J4izDw",
			"file_size": "187422"
		}
	}],
	"message_format": "array",
	"post_type": "message",
	"group_id": 575105611,
	"group_name": "白玉楼聊天室"
}
*/

module.exports = QQMessage