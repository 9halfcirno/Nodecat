import Bridge from "../onebot_bridge.js";
import Queue from "../queue.js"
import {
	AllTrigger,
	CustomTrigger,
	EndsWithTrigger,
	FullTrigger,
	IncludesTrigger,
	RegExpTrigger,
	StartsWithTrigger
} from "../qq_message_trigger.js";
import QQMsgSender from "../qq_message_sender.js"
import DataManager from "../data_mamager.js"
import Command from "../command_manager.js"
import MsgConstructor from "../qq/message_constructor.js"
import network from "../network.js"
import Cron from "../cron.js"

class API {
	#context; // 上下文引用
	#msgSendQueue; // 消息发送队列
	#dataMap; // 数据存储
	#registeredCommands = []; // 记录插件注册的指令和回调
	#cronJobs = []; // 记录插件注册的指令和回调
	constructor({
		context,
		dataMap
	}) {
		this.#context = context;
		this.#dataMap = dataMap;
		this.msgTriggers = [];
		this.requestTriggers = [];
		this.msgSentTriggers = [];
		this.noticeTriggers = [];

		this.#msgSendQueue = new Queue([], ({
			msg,
			opts
		}) => {
			QQMsgSender.send(msg, opts)
		})
	}

	get onebot() {
		return {
			send(action, params) {
				return Bridge.send(action, params)
			}
		}
	}

	get context() {
		return this.#context;
	}

	get data() {
		return this.#dataMap;
	}

	get network() {
		return network;
	}

	async require(id) {
		if (!this.#context.manager.pluginLoaded.has(id)) {
			await this.#context.manager.loadPluginById(id)
		}
		return this.#context.manager.exports.get(id)
	}

	set exports(exp) {
		this.#context.exports = exp;
	}

	get message() {
		const msg = new MsgConstructor();
		return msg
	}

	get path() {
		let self = this;
		return {
			plugin: self.#context.pluginPath
		}
	}

	sendGroupMessage(group, msg, opts = {}) {
		if (opts.queue === false) {
			QQMsgSender.send(msg, {
				group
			})
		} else {
			this.#msgSendQueue.add({
				msg: msg,
				opts: {
					group
				}
			})
		}
	}

	sendFriendMessage(friend, msg, opts = {}) {
		if (opts.queue === false) {
			QQMsgSender.send(msg, {
				user: friend
			});
		} else {
			this.#msgSendQueue.add({
				msg: msg,
				opts: {
					user: friend
				}
			});
		}
	}

	sendPrivateMessage(group, user, msg, opts = {}) {
		if (opts.queue === false) {
			QQMsgSender.send(msg, {
				user,
				group
			});
		} else {
			this.#msgSendQueue.add({
				msg: msg,
				opts: {
					user,
					group
				}
			});
		}
	}

	replyMessage(msg, content, opts = {}) {
		if (!msg.post_type) { // 不是原始数据
			// 群消息
			if (msg.group && msg.group.id) {
				return this.sendGroupMessage(
					msg.group.id,
					content,
					opts
				);
			}

			// 私聊 / 好友消息
			if (msg.sender && msg.sender.id) {
				// 如果你区分 friend / private，可以在这里细分
				return this.sendFriendMessage(
					msg.sender.id,
					content,
					opts
				);
			}
		} else { // 是原始数据
			// 群消息
			if (msg.group_id) {
				return this.sendGroupMessage(
					msg.group_id,
					content,
					opts
				);
			}

			// 私聊 / 好友消息
			if (msg.user_id) {
				// 如果你区分 friend / private，可以在这里细分
				return this.sendFriendMessage(
					msg.user_id,
					content,
					opts
				);
			}
		}
		// 之所以没写发送私聊，是因为私聊容易被检测

		throw new Error("无法判断回复目标：msg 缺少 group.id 或 sender.id");
	}

	get onMessage() {
		const self = this;
		const ret = {};
		const onMsg = {
			full(str) {
				let trigger = new FullTrigger(str);
				self.msgTriggers.push(trigger)
				return trigger
			},
			startsWith(str) {
				let trigger = new StartsWithTrigger(str);
				self.msgTriggers.push(trigger);
				return trigger
			},
			endsWith(str) {
				let trigger = new EndsWithTrigger(str);
				self.msgTriggers.push(trigger);
				return trigger
			},
			includes(str) {
				let trigger = new IncludesTrigger(str);
				self.msgTriggers.push(trigger);
				return trigger
			},
			all() {
				let trigger = new AllTrigger();
				self.msgTriggers.push(trigger);
				return trigger
			},
			regexp(reg) {
				let trigger = new RegExpTrigger(reg);
				self.msgTriggers.push(trigger);
				return trigger
			},
			custom(pat) {
				let trigger = new CustomTrigger(pat);
				self.msgTriggers.push(trigger);
				return trigger
			}
		};
		return new Proxy(ret, {
			get(obj, key) {
				if (onMsg[key]) {
					return onMsg[key]
				} else console.warn(`不存在的触发器: ${key}`);

			}
		})
	}

	get onCommand() {
		let self = this;
		return (cmd, opts) => {
			return {
				then(cb) {
					Command.register(cmd, cb, opts);
					// 保存到已注册列表，用于卸载时清理
					self.#registeredCommands.push({
						cmd,
						cb
					});
					return this;
				}
			};
		};
	}

	get cron() {
		let self = this;
		return (cron, opts) => {
			return {
				then(cb) {
					self.#cronJobs.push(new Cron.Job(cron, cb, opts));
					return this;
				}
			};
		};
	}

	get onMessageSent() {
		let self = this;
		return {
			then(cb) {
				self.msgSentTriggers.push(cb);
				return this;
			}
		}
	}

	get onNotice() {
		let self = this;
		return {
			then(cb) {
				self.noticeTriggers.push(cb);
				return this;
			}
		}
	}

	get onRequest() {
		let self = this;
		return {
			then(cb) {
				self.requestTriggers.push(cb);
				return this;
			}
		}
	}

	get onPoke() {
		//let this.
		return {
			then(cb) {

			}
		}
	}

	_clearRegisteredCommands() {
		this.#registeredCommands.forEach(({
			cmd,
			cb
		}) => {
			Command.unregister(cmd, cb); // 卸载回调
		});
		this.#registeredCommands = []; // 清空记录
	}

	_clearCronJobs() {
		this.#cronJobs.forEach(job => {
			job.cancel(); // 卸载任务
		});
		this.#cronJobs = []; // 清空记录
	}
}

export default API