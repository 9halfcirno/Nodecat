// ANSI 颜色代码
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";

const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";

const p = {
	id: "built-in-logger",

	main(cat) {
		cat.onMessage.all().then(async msg => {
			const botId = msg.data.self_id || "unknown";

			// 构建输出
			// 接收Bot
			let output = `${BLUE}Bot:${botId}${RESET} ${MAGENTA}${BOLD}[收]${RESET}`;

			// 接收方向
			if (msg.from === "group") {
				output += `\n${GREEN}[群聊]${RESET} `;
			} else {
				output += `\n${BLUE}[私聊]${RESET} `;
			}

			// 群聊信息
			if (msg.from === "group" && msg.group) {
				output += `${BOLD}${YELLOW}${msg.group.name || "未知"}${RESET} ${DIM}#${msg.group.id}${RESET} \n`;
			}

			// 用户信息
			const userName = msg.sender.card || msg.sender.nickname || "未知";
			output += `${BOLD}${CYAN}${userName}${RESET}${DIM}(${msg.sender.id})${RESET}`;

			// 用户角色（群聊时显示）
			if (msg.from === "group" && msg.sender.role) {
				const roleMap = {
					owner: `${YELLOW}[群主]${RESET}`,
					admin: `${GREEN}[管理]${RESET}`,
					member: `${CYAN}[成员]${RESET}`
				};
				output += ` ${roleMap[msg.sender.role] || ""}`;
			}

			// 消息内容
			output += `: \n${BOLD}${WHITE}${await msg.getDetailedMessage() || ""}${RESET}`;

			console.log(output);
		});

		cat.onMessageSent.then(async msg => {
			const botId = msg.data.self_id || "unknown";

			// 构建输出
			// 接收Bot
			let output = `${BLUE}Bot:${botId}${RESET} ${YELLOW}${BOLD}[发]${RESET}`;

			// 发送方向
			if (msg.from === "group") {
				output += `\n${GREEN}[群聊]${RESET} `;
			} else {
				output += `\n${BLUE}[私聊]${RESET} `;
			}

			// 群聊信息
			if (msg.from === "group" && msg.group) {
				output += `${BOLD}${YELLOW}${msg.group.name || "未知"}${RESET} ${DIM}#${msg.group.id}${RESET} \n`;
			} else {
				// 用户信息
				let user = {};
				try {
					user = (await cat.onebot.send("get_stranger_info", {
						user_id: msg.data.target_id
					}));
				} catch (e) {
				}
				const userName = user.nickname || "未知";
				output += `${BOLD}${CYAN}${userName}${RESET}${DIM}(${msg.data.target_id})${RESET}\n`;
			}

			// 消息内容
			output += `${BOLD}${YELLOW}${await msg.getDetailedMessage() || ""}${RESET}`;

			console.log(output);
		});
	}
}

export default p;