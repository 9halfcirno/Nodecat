// 定义颜色常量
const RESET = '\x1b[0m';
const BRIGHT = '\x1b[1m';
const DIM = '\x1b[2m';

// 前景色
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const WHITE = '\x1b[37m';
module.exports = {
	metaInfo: {
		id: "print_message"
	},
	main(cat) {
		cat.onMessage.all(msg => {
			// 构建群组信息部分
			let groupInfo = "";
			if (msg.from === "group") {
				const groupId = `[${msg.rawData.group_id}]`;
				const groupName = msg.rawData.group_name ? `[${msg.rawData.group_name}]` : "";
				// 群号用洋红色，群名称用青绿色（如果存在）
				groupInfo = `${MAGENTA}${groupId}${groupName ? CYAN + groupName + RESET : ""}${RESET}`;
			}

			// 构建彩色日志
			const coloredLog =
				// 机器人ID - 青色加粗
				`${BRIGHT}${CYAN}[${msg.rawData.self_id}]${RESET}` +
				// 方向标记 - 黄色
				`[${YELLOW}收${RESET}]` +
				// Message标记 - 蓝色
				`[${BLUE}Message${RESET}]` +
				"\n" +
				// 消息来源 - 绿色
				`[${GREEN}${msg.from}${RESET}]` +
				// 群组信息（如果有）
				groupInfo +
				`\n` +
				// 发送者ID - 青色
				`[${CYAN}${msg.rawData.user_id}${RESET}]` +
				// 发送者名称 - 黄色
				`[${YELLOW}${msg.rawData.sender.card || msg.rawData.sender.nickname}${RESET}]` +
				// 冒号 - 白色
				`${WHITE}:${RESET}` +
				`\n` +
				// 消息内容 - 亮白色
				`${BRIGHT}${WHITE}${msg.text}${RESET}`;

			print.log(coloredLog);
		})
	}
}
