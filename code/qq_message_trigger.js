import QQMessage from "./qq/message.js";

class Trigger {
	/**
	 * 
	 * @param {Function} pat 断言函数
	 */
	constructor(pat = () => {}) {
		this.pat = pat;
		this.cbs = [];
	}

	then(callback) {
		callback && this.cbs.push(callback);
		return this;
	}

	test(msg) {
		if (!(msg instanceof QQMessage)) {
			msg = new QQMessage(data)
		}
		if (this.pat(msg)) {
			for (const cb of this.cbs) {
				cb?.(msg);
			}
		}
	}
}

/**
 * 
 * @param {QQMessage} msg 
 */
function textOf(msg) {
	let i = 0;
	for (i = 0; i < msg.content.length; i++) {
		if (msg.content[i].type === "reply") continue;
		if (msg.content[i].type === "at" && msg.content[i].data?.qq == msg.data.self_id) continue;
		break;
	};
	return msg.toString(i).trim();
}

class FullTrigger extends Trigger {
	constructor(str) {
		super(msg => textOf(msg) === str)
		this.string = str;
	}
}

class RegExpTrigger extends Trigger {
	constructor(reg) {
		super(msg => reg.test(textOf(msg)));
		this.regexp = reg;
	}
}

class StartsWithTrigger extends Trigger {
	constructor(str) {
		super(msg => textOf(msg).startsWith(str));
		this.string = str;
	}
}

class EndsWithTrigger extends Trigger {
	constructor(str) {
		super(msg => textOf(msg).endsWith(str));
		this.string = str;
	}
}

class IncludesTrigger extends Trigger {
	constructor(str) {
		super(msg => textOf(msg).includes(str));
		this.string = str;
	}
}

class AllTrigger extends Trigger {
	constructor() {
		super(() => true)
	}
}

class CustomTrigger extends Trigger {
	constructor(pat) {
		super(pat);
		this.pattern = pat;
	}
}

export {
	FullTrigger,
	RegExpTrigger,
	StartsWithTrigger,
	EndsWithTrigger,
	IncludesTrigger,
	AllTrigger,
	CustomTrigger,
	Trigger
}