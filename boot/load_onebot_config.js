import OneBotBridge from "../code/onebot_bridge.js"

export default (async function() {
	console.log(`[Config] 加载登录号信息`)
	let data
	try {
		
		data = await OneBotBridge.send("get_login_info");
		
		NodecatConfig.Bot.QQ = data.user_id;
		NodecatConfig.Bot.nickname = data.nickname;
		console.log(`[Config] 加载的登录号信息: Nickname: ${NodecatConfig.Bot.nickname} / QQ: ${NodecatConfig.Bot.QQ}`)
	} catch(e) {
		console.error(`[Config] 无法加载登录号信息！将默认使用连接成功时的QQ号: ${NodecatConfig.Bot.QQ}, Error: ${e.message}`)
	}
})