const fs = require("fs")
const path = require("path")
const print = require("./modules/print.js")
//const DataManager = require("./modules/data_manager.js")
const PluginManager = require("./modules/plugin_manager.js")

const NODECAT_VERSION = "0.0.3"

globalThis.print = print;
print.log(`Nodecat v${NODECAT_VERSION} 正在启动`)

globalThis.NodecatConfig = {
	account: 1145141919,
	napcat_ws_token: "123456789",
	napcat_ws_url: "ws://127.0.0.1:3001/"
};
try {
	NodecatConfig = JSON.parse(fs.readFileSync("config.json"))
	print.log("读取配置文件成功")
} catch (e) {
	print.error("读取配置文件时出错: " + e)
}
NodecatConfig.nodecat_run_path = process.cwd();

const onebot = require("./OneBot v11.js")
const Client = require("./modules/ws_client.js")
require("./modules/ws_message_handler.js")

// app.js - 主入口文件
const http = require('http');

// 1. 全局异常捕获
process.on('uncaughtException', (err, origin) => {
	print.error('[未捕获的异常]', {
		error: err.message,
		stack: err.stack,
		origin: origin
	});
});

process.on('unhandledRejection', (reason, promise) => {
	
});

// 3. 信号处理（Ctrl+C等）
process.on('SIGINT', () => {
	print.log(`正在关闭WS客户端...`);
	Client.close();
	print.log(`正在保存插件数据`)
	PluginManager.saveAllPluginData();
	print.log(`Nodecat已退出`)
});

Client.connect(NodecatConfig.napcat_ws_url, NodecatConfig.napcat_ws_token, e => {
	if (e) {
		throw e
	};
})

PluginManager.loadAllPlugins();
