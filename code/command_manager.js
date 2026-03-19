import Permission from "./permission_system.js";
import fm from "./file_manager.js";

class TrieNode {
	constructor() {
		this.children = new Map();
		this.callbacks = null; // [{ fn, permission }]
	}
}
let Command = {
	root: new TrieNode(),
	/**
	 * 注册指令
	 * @param {string} cmd
	 * @param {Function} callback
	 * @param {Object} [options] {permission: string} 默认 member
	 */
	register(cmd, callback, options = {}) {
		if (!cmd || typeof cmd !== "string") throw new Error("Command must be non-empty string");
		if (typeof callback !== "function") throw new Error("Callback must be function");

		const perm = options.permission || "member";
		const only = options.only || "all";
<<<<<<< HEAD
		const always = options.always || false;
=======
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946

		let node = this.root;
		for (const ch of cmd) {
			if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
			node = node.children.get(ch);
		}

		if (!node.callbacks) node.callbacks = [];
		node.callbacks.push({
			fn: callback,
			permission: perm,
<<<<<<< HEAD
			only: only,
			always: always
=======
			only: only
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
		});
	},

	/**
	 * 注销指令
	 * @param {string} cmd
	 * @param {Function} [callback]
	 */
	unregister(cmd, callback) {
		if (!cmd || typeof cmd !== "string") throw new Error("Command must be non-empty string");

		let node = this.root;
		const stack = [];

		for (const ch of cmd) {
			if (!node.children.has(ch)) return false;
			stack.push([node, ch]);
			node = node.children.get(ch);
		}

		if (!node.callbacks) return false;

		if (callback) {
			const idx = node.callbacks.findIndex(c => c.fn === callback);
			if (idx === -1) return false;
			node.callbacks.splice(idx, 1);
		} else {
			node.callbacks.length = 0;
		}

		if (node.callbacks.length === 0) node.callbacks = null;

		for (let i = stack.length - 1; i >= 0; i--) {
			const [parent, ch] = stack[i];
			const child = parent.children.get(ch);
			if (!child.callbacks && child.children.size === 0) parent.children.delete(ch);
			else break;
		}

		return true;
	},

	/**
	 * 执行指令（权限检查）
	 * @param {QQMessage} msg
	 */
	execute(msg) {
		if (!msg || typeof msg.toNormalString !== "function") {
			throw new Error("[Command] execute expects QQMessage with toNormalString()");
		}

		let input = msg.toNormalString().trim();
		if (!input) return false;

		// ✅ 自动去掉最前面的斜杠
		if (input[0] === "/") {
			input = input.slice(1).trim();
		}

		let node = this.root;
		let lastMatch = null;
		let lastMatchIndex = 0;

		// ✅ 不再以空格作为终止条件
		for (let i = 0; i < input.length; i++) {
			const ch = input[i];

			if (!node.children.has(ch)) break;

			node = node.children.get(ch);

			if (node.callbacks) {
				lastMatch = node;
				lastMatchIndex = i + 1;
			}
		}

		if (!lastMatch) return false;

		const rest = input.slice(lastMatchIndex).trim();
		const args = rest ? this._parseArgs(rest) : [];

		const commandName = input.slice(0, lastMatchIndex).trim();

		for (const {
<<<<<<< HEAD
			fn,
			permission,
			only,
			always,
		}
			of lastMatch.callbacks) {
			
			if (msg.group?.id &&
				(NodecatConfig.Groups.settings[msg.group.id]?.enable !== undefined &&
					!NodecatConfig.Groups.settings[msg.group.id]?.enable))
				if (!always) continue; // 群组关闭bot
			
=======
				fn,
				permission,
				only
			}
			of lastMatch.callbacks) {
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
			if (!Permission[`is${permission[0].toUpperCase() + permission.slice(1)}`](msg.sender.role)) {
				msg.reply(`[CQ:at,qq=${msg.sender.id}] 你没有权限调用 ${commandName} 指令`);
				continue;
			}
			if (only !== "all" && only !== msg.from) {
				msg.reply(`[CQ:at,qq=${msg.sender.id}] ${input.split(" ")[0]}指令调用仅限${only}`);
				continue;
			}
			fn(msg, args, input);
		}

		return true;
	},

	_parseArgs(str) {
		const result = [];
		let cur = "";
		let inQuotes = false;

		for (let i = 0; i < str.length; i++) {
			const ch = str[i];
			if (ch === '"') {
				inQuotes = !inQuotes;
				continue;
			}
			if (ch === " " && !inQuotes) {
				if (cur) {
					result.push(cur);
					cur = "";
				}
				continue;
			}
			cur += ch;
		}
		if (cur) result.push(cur);
		return result;
	},
}

export default Command;

<<<<<<< HEAD
=======
Command.register("op", (msg, args) => {
	let target = msg.content[msg.content.length - 1].data.qq;
	if (!target) return;
	switch (args[0]) {
		case "set":
			if (!NodecatConfig.Operators.includes(target)) NodecatConfig.Operators.push(parseInt(target));
			msg.reply(`[CQ:at,qq=${target}] 已成为Nodecat管理员！`)
			break;
		case "del":
			if (NodecatConfig.Operators.includes(target)) NodecatConfig.Operators.splice(NodecatConfig.Operators.indexOf(parseInt(target)), 1);
			msg.reply(`[CQ:at,qq=${target}] 已不再是Nodecat管理员！`)
			break;
	};
	let f = new fm("./config/permission.json");
	f.writeSync(JSON.stringify({
		master: NodecatConfig.Master,
		operators: NodecatConfig.Operators
	}, null, 2))
}, {
	permission: "master"
})
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
