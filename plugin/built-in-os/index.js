import os from "os";

export default {
	main(cat) {
		cat.onCommand("os").then(async msg => {
			const onebot = await cat.onebot.send("get_version_info");
			msg.reply(`Nodecat OS Info
| app_name: ${onebot.app_name}
| app_version: ${onebot.app_version}
| protocol_ver: OneBot ${onebot.protocol_version}
| platform: ${os.platform()}
| os_type: ${os.type()}
| os_version: ${os.version()}
| os_machine: ${os.machine()}`)
		})
	}
}