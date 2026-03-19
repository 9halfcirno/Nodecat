export default {
	main(cat) {
		cat.onCommand("exit", {
			permission: "admin",
			only: "group"
		}).then(msg => setExit(msg))
		
		async function setExit(msg) {
			await cat.onebot.send("send_msg", {
				message: `[CQ:reply,id=${msg.id}] ${NodecatConfig.Bot.nickname || "unknown"}即将退出本群`,
				group_id: msg.group.id
			})
			await cat.onebot.send("set_group_leave", {
				group_id: msg.group.id
			})
			console.log(`[Exit] BOT已退出群: ${msg.groupId}`)
		}
	}
}