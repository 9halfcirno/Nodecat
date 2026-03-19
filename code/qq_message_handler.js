import Command from "./command_manager.js";
import Plugin from "./plugin_module/manager.js"
import QQMessage from "./qq/message.js"

export default {
	handleMessage(msg) {
		if (!(msg instanceof QQMessage)) msg = new QQMessage(msg);
		const text = msg.toNormalString(); // 转为开头不包含回复和@ME的字符串;
<<<<<<< HEAD
		
=======
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
		if (text[0] === "/") {
			if (Command.execute(msg)) {
				return;
			}
		}
<<<<<<< HEAD
		if (msg.group?.id &&
			(NodecatConfig.Groups.settings[msg.group.id]?.enable !== undefined &&
				!NodecatConfig.Groups.settings[msg.group.id]?.enable))
			return; // 群组关闭bot
=======
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
		Plugin.triggerMessage(msg);
	}
}