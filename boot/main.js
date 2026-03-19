import fs from "fs";
import {
	parentPort
} from 'worker_threads';

import loadConfig from "./load_config.js"
import connectToOneBot from "./connect_to_onebot.js"
import createBridge from "./create_onebot_bridge.js"
import loadOneBotConfig from "./load_onebot_config.js"
import loadPlugin from "./load_plugin.js"
import OneBotMessageHandler from "../code/onebot_message_handler.js"
import onExit from "../code/on_exit.js"
import QQMsgHandler from "../code/qq_message_handler.js"
import {
	printMsg,
	printSentMsg
} from "../code/onebot_message_logger.js";
//import test from "../code/data_mamager.js"

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
	const pluginManager = await loadPlugin()
	// 注册消息处理器
	const messageHandler = new OneBotMessageHandler(bridge);
	// 注册消息打印
	messageHandler
		.onMessage(printMsg)
		.onMessageSent(printSentMsg);

	messageHandler.onMessage(msg => {
		QQMsgHandler.handleMessage(msg)
	})
	messageHandler.onMessageSent(msg => {
		pluginManager.triggerMessageSent(msg)
	})
	messageHandler.onNotice(not => {
		pluginManager.triggerNotice(not)
	})
	messageHandler.onRequest(req => {
		pluginManager.triggerRequest(req)
	})

	const packageInfo = JSON.parse(fs.readFileSync("./package.json"))

	console.log(`Nodecat Version: ${packageInfo.version}

=================

Nodecat framework is running now!

=================
`);
	parentPort?.postMessage({
		cmd: "notice",
		notice: "ok"
	})
};
main();

process.on('uncaughtException', (err, origin) => {
	console.error('[Error] 未捕获异常', {
		error: err.message,
		stack: err.stack,
		origin: origin
	});
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('[Promise] 未处理被拒绝期约', {
		reason,
	});
});

// 监听主线程消息
parentPort?.on('message', (msg) => {
	if (msg.cmd === 'shutdown') {
		onExit.exit()
	}
});