import os from "os";

export default {
	id: "built-in-os",
	
	main(cat) {
		cat.onCommand("os").then(async msg => {
			const onebot = await cat.onebot.send("get_version_info");
			
			msg.reply(`Nodecat OS Info
| app name: ${onebot.app_name}
| app ver: ${onebot.app_version}
| protocol ver: OneBot ${onebot.protocol_version}
| platform: ${os.platform()}
| os_type: ${os.type()}
| os_version: ${os.version()}
| os_machine: ${os.machine()}`)
		})
	}
}