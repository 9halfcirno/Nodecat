import loadConfig from "./load_config.js"
import connectToOneBot from "./connect_to_onebot.js"
import createBridge from "./create_onebot_bridge.js"
import loadPlugin from "./load_plugin.js"
import loadOneBotConfig from "./load_onebot_config.js"
import OneBotMessageHandler from "../code/onebot_message_handler.js"
//import loadTUI from "./load_tui.js"

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";

const BOLD = "\x1b[1m";
// 保存原始 console 方法
const originalConsole = {
	...console
};

// 格式化时间函数
function formatTime() {
	const now = new Date();
	return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}

// 重写 console 方法
console.log = (...args) => {
	originalConsole.log(`[${formatTime()}]${BLUE}[INFO]${RESET}`, ...args);
};

console.info = (...args) => {
	originalConsole.info(`[${formatTime()}]${BLUE}[INFO]${RESET}`, ...args);
};

console.warn = (...args) => {
	originalConsole.warn(`[${formatTime()}]${YELLOW}[WARN]${RESET}`, ...args);
};

console.error = (...args) => {
	originalConsole.error(`[${formatTime()}]${RED}${BOLD}[ERROR]${RESET}${RED}`, ...args, `${RESET}`);
};

async function main() {
	await loadConfig();
	
	//await loadTUI();
	
	const connect = await connectToOneBot();
	const bridge = await createBridge(connect);
	await loadOneBotConfig(bridge);
	const pluginManager = await loadPlugin();


	// 注册消息处理器
	const messageHandler = new OneBotMessageHandler(bridge);
	messageHandler.onMessage(msg => {
		pluginManager.triggerMessage(msg)
	})
	messageHandler.onMessageSent(msg => {
		pluginManager.triggerMessageSent(msg)
	})
	
	console.log(`Nodecat Version: 0.2.0

===============

Nodecat framework is running now!

===============
`);
};
main();