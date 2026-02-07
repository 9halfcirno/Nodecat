class MessageConstructor {
	constructor() {
		this.content = [];
	}

	block(type, data) {
		this.content.push[{
			type,
			data
		}]
		return this;
	}

	text(text) {
		this.block("text", {
			text.toString()
		});
		return this;
	}

	at(qq) {
		this.block("at", {
			qq.toString()
		});
		return this;
	}

	reply(id) { // 特殊处理，让reply只出现在第一个，且只有一个
		const block = {
			type: "reply",
			data: {
				id: id.toString()
			}
		}
		if (!this.content[0] || this.content[0]?.type === "reply") this.content[0] = block;
		else this.content.unshift(block);
		return this;
	}

	// face(id) {
	// this.block("face", {id})
	// }

	// dice() {

	// }


	image({
		file,
		url,
		summary,
		subType
	}) {
		this.block("image", {
			file: file,
			url: url,
			summary: summary,
			sub_type: subType
		});
		return this;
	}

	record({
		file
	}) {
		this.block("record", {
			file
		});
		return this;

	}

	video({
		file,
		thumb
	}) {
		this.("video", {
			file,
			thumb
		})
	};
	return this;
}