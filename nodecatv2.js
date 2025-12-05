const fs = require("fs")
const path = require("path")
const print = require("./modules/print.js")
//const DataManager = require("./modules/data_manager.js")
const PluginManager = require("./modules/plugin_manager.js")

globalThis.NodecatConfig = {
	account: 1145141919,
	napcat_ws_token: "RDdoV:{)(wI8k__w",
	napcat_ws_url: "ws://127.0.0.1:5001/"
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

Client.connect(NodecatConfig.napcat_ws_url, NodecatConfig.napcat_ws_token, e => {
	if (e) {
		throw e
	};
	/*Client.tellNapcat("send_msg", {
		message: "你好",
		user_id: 1531019086
	}, data => {
		if (data.status === "ok") print.log("发送成功");
		else print.error(data)
		process.exit()
	})*/
})

PluginManager.loadAllPlugins();