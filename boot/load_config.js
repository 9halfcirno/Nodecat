import fs from "fs"

globalThis.NodecatConfig = {};
export default (async function() {
	// 加载 OneBot 网络配置
	const onebot = readConfig("onebot.json");
	NodecatConfig.OneBotNetwork = onebot;
	if (onebot) console.log(`[Config] 成功加载配置: OneBotNetwork`)

	// 加载 Sandbox 网络配置
	const sandbox = readConfig("sandbox.json");
	NodecatConfig.Sandbox = sandbox;
	if (sandbox) console.log(`[Config] 成功加载配置: Sandbox`)
	
	// 加载 Permission 网络配置
	const per = readConfig("permission.json");
	NodecatConfig.Master = per.master;
	NodecatConfig.Operators = per.operators;
	if (per) console.log(`[Config] 成功加载配置: Permission`)
	
	
	
	
	NodecatConfig.Bot = {}
})


function readConfig(file) {
	try {
		return JSON.parse(fs.readFileSync(`./config/${file}`))
	} catch (e) {
		console.error(`读取配置文件"${file}"失败！\nError: ${e.message}`)
		return;
	}
}