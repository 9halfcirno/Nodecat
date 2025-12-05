class Message {
	constructor(data) {
		this.from = data.from; // 消息来自哪里
		//this.
	}
}

/*
{
	"self_id": 111222333,
	"user_id": 444555666,
	"time": 1763817348,
	"message_id": 730342765,
	"message_seq": 730342765,
	"real_id": 730342765,
	"real_seq": "308447",
	"message_type": "group",
	"sender": {
		"user_id": 444555666,
		"nickname": "用户A",
		"card": "",
		"role": "admin"
	},
	"raw_message": "测试消息",
	"font": 14,
	"sub_type": "normal",
	"message": [{
		"type": "text",
		"data": {
			"text": "测试消息"
		}
	}],
	"message_format": "array",
	"post_type": "message",
	"group_id": 123456789,
	"group_name": "群a"
}
*/