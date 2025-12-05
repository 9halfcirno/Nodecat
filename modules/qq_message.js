class QQMessage {
	constructor(data) {
		this.rawData = data;
		this.id = data.message_id;
		this.rawText = data.raw_message;
		this.content = data.message;
		this.contentFormat = data.message_format;
		this.from = data.message_type;
		
		this.groupId = data.group_id;
		this.userId = data.user_id;
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

	getSender() {
		//return 
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