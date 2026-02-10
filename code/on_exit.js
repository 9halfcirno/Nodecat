import Command from "./command_manager.js"

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
			console.error(`[Exit] execute ${f.name} error.\nError: ${e.message}`)
		}
	}
}

Command.register("kill", (msg) => {
	process.off("SIGINT", exit);
	process.off("SIGTERM", exit);
	msg.reply(`正在尝试关闭Nodecat!`);
	try {
		exit();
	} catch(e) {
		console.error(e);
		msg.reply(`关闭Nodecat时发生错误！${e.message}`);
	}
}, {
	permission: "master"
})

export default (async function(cb) {
	onExit.push(cb)
})