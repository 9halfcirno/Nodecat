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
				try {
					cb?.(msg);
				} catch(e) {
					msg.reply(`Error: ${e.message}`)
				}
			}
		}
	}
}


class FullTrigger extends Trigger {
	constructor(str) {
		super(msg => msg.toNormalString() === str)
		this.string = str;
	}
}

class RegExpTrigger extends Trigger {
	constructor(reg) {
		super(msg => reg.test(msg.toNormalString()));
		this.regexp = reg;
	}
}

class StartsWithTrigger extends Trigger {
	constructor(str) {
		super(msg => msg.toNormalString().startsWith(str));
		this.string = str;
	}
}

class EndsWithTrigger extends Trigger {
	constructor(str) {
		super(msg => msg.toNormalString().endsWith(str));
		this.string = str;
	}
}

class IncludesTrigger extends Trigger {
	constructor(str) {
		super(msg => msg.toNormalString().includes(str));
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