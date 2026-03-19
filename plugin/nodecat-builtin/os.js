import os from "os";

export default {
	main(cat) {
		cat.onCommand("os").then(async msg => {
			const onebot = await cat.onebot.send("get_version_info");
<<<<<<<< HEAD:plugin/built-in-os/index.js

			msg.reply(`Nodecat OS Info
| app_name: ${onebot.app_name}
| app_version: ${onebot.app_version}
========
			
			msg.reply(`Nodecat OS Info
| app name: ${onebot.app_name}
| app ver: ${onebot.app_version}
>>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946:plugin/nodecat-builtin/os.js
| protocol ver: OneBot ${onebot.protocol_version}
| platform: ${os.platform()}
| os_type: ${os.type()}
| os_version: ${os.version()}
| os_machine: ${os.machine()}`)
		})
	}
}