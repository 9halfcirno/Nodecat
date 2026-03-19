import Command from "./command_manager.js"
<<<<<<< HEAD
import {
	parentPort
} from 'worker_threads';

=======
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946

const onExit = [];

let hadSet = false;

const exit = () => {
	if (hadSet) return;
	hadSet = true;
	console.log(`=================`)
	console.log(`Nodecat 正在退出...`)
	beforeExit().then(() => {
		console.log(`Nodecat 已关闭！`)
		process.exit();
	})
};

process.on("SIGINT", exit);
process.on("SIGTERM", exit);

async function beforeExit() {
	for (let f of onExit) {
		try {
			if (typeof f === "function") await f();
		} catch (e) {
<<<<<<< HEAD
			console.error(`[Exit] execute ${f.name} error.\nError:`, e)
=======
			console.error(`[Exit] execute ${f.name} error.\nError: ${e.message}`)
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
		}
	}
}

Command.register("kill", (msg) => {
	process.off("SIGINT", exit);
	process.off("SIGTERM", exit);
	msg.reply(`正在尝试关闭Nodecat!`);
	try {
		exit();
<<<<<<< HEAD
	} catch (e) {
=======
	} catch(e) {
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
		console.error(e);
		msg.reply(`关闭Nodecat时发生错误！${e.message}`);
	}
}, {
	permission: "master"
})

<<<<<<< HEAD
Command.register("system", (msg, args) => {
	if (args[0] === "kill") {
		process.off("SIGINT", exit);
		process.off("SIGTERM", exit);
		msg.reply(`正在尝试关闭Nodecat!`);
		try {
			exit();
		} catch (e) {
			console.error(e);
			msg.reply(`关闭Nodecat时发生错误！${e.message}`);
		}
	} else if (args[0] === "reload") {
		msg.reply(`Nodecat 正在尝试重载`)
		parentPort.postMessage({
			cmd: "restart",
			group: msg.group?.id,
			user: msg.sender.id
		})
	}
}, {
	permission: "master"
})

const exp = (async function(cb) {
	onExit.push(cb)
})

exp.exit = exit;

export default exp
=======
export default (async function(cb) {
	onExit.push(cb)
})
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
