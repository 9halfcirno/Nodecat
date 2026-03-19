class QQPoke {
	constructor(data) {
		if (data.post_type !== "notice" ||
			data.notice_type !== "notify" ||
			data.sub_type !== "poke"
		) throw new Error(`[QQPoke] 错误的数据类型:`, data);

		this.time = data.time;

		this.from = data.group_id ? "group" : "private";
		
		this.sender = {
			id: data.user_ud
		};
		this.target = {
			id: data.target_id
		};
		if (this.from === "group") this.group = {
			id: data.group_id
		};
		
	}
}