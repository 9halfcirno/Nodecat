class QQGroupIncrease {
	constructor(data) {
		if (data.post_type !== "notice" ||
			data.notice_type !== "group_increase"
		) throw new Error(`[QQGroupIncrease] 错误的数据类型:`, data);

		this.time = data.time;

		this.from = "group";

		this.operator = {
			id: data.operator_ud
		};
		this.target = {
			id: data.target_id
		};
		this.group = {
			id: data.group_id
		}
		this.type = data.sub_type
	}
}