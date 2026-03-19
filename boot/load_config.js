import fs from "fs"
import fm from "../code/file_manager.js"
import onExit from "../code/on_exit.js";
import Command from "../code/command_manager.js";

globalThis.NodecatConfig = {};
export default (async function () {
	// 加载 OneBot 网络配置
	const onebot = readConfig("onebot.json");
	NodecatConfig.OneBotNetwork = onebot;
	if (onebot) console.log(`[Config] 成功加载配置: OneBotNetwork`)

<<<<<<< HEAD
	// 加载 Sandbox 沙盒配置
=======
	// 加载 Sandbox 网络配置
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
	const sandbox = readConfig("sandbox.json");
	NodecatConfig.Sandbox = sandbox;
	if (sandbox) console.log(`[Config] 成功加载配置: Sandbox`)

	// 加载 Permission 权限配置
	const perFm = new fm("./config/permission.json");
	let per = JSON.parse(perFm.readSync());
	if (!per) {
		per = {
			master: null,
			operators: [],
			white_plan: []
		};
		console.log(`[Config] 配置 Permission 不存在，将启用默认值`);
	}
	NodecatConfig.Master = per.master;
	NodecatConfig.Operators = per.operators;
	NodecatConfig.WhitePlan = per.white_plan;
	if (per) console.log(`[Config] 成功加载配置: Permission`)
	Command.register("white", (msg, args) => {
		if (!parseFloat(args[1])) {
			msg.reply(`请输入正确的群号`);
			return;
		};
		args[1] = parseFloat(args[1]);
		switch (args[0]) {
			case "add":
				if (!per.white_plan.includes(args[1])) per.white_plan.push(args[1]);
				msg.reply(`群 ${args[1]} 已添加至白名单`);
				break;
			case "remove": 
				if (per.white_plan.includes(args[1])) per.white_plan.splice(per.white_plan.indexOf(parseInt(args[1])), 1);
				msg.reply(`群 ${args[1]} 已移除白名单`)
		}
	}, {
		permission: "operator",
		always: true
	})
	Command.register("op", (msg, args) => {
		let target = msg.content[msg.content.length - 1].data.qq;
		if (!target) return;
		switch (args[0]) {
			case "set":
				if (!per.operators.includes(target)) per.operators.push(parseInt(target));
				msg.reply(`[CQ:at,qq=${target}] 已成为Nodecat管理员！`)
				break;
			case "del":
				if (per.operators.includes(target)) per.operators.splice(per.operators.indexOf(parseInt(target)), 1);
				msg.reply(`[CQ:at,qq=${target}] 已不再是Nodecat管理员！`)
				break;
		};
	}, {
		permission: "master",
		always: true
	})

	// 加载群组配置
	const groupsFm = new fm("./storage/data/groups.json");
	let groups = JSON.parse(groupsFm.readSync());
	
<<<<<<< HEAD
	if (!groups) groups = { settings: {} };
	NodecatConfig.Groups = groups;
	// groupsFm.writeSync(JSON.stringify(groups), null, 2)

	console.log(`[Config] 成功加载配置: Groups`);
	

	Command.register("group", (msg, args) => {
		if (msg.from !== "group") return;
		let group = groups.settings[msg.group.id];
		if (!group) {
			group = {
				enable: true,
			}

		}
		switch (args[0]) {
			case "on":
				group.enable = true;
				msg.reply(`Nodecat已在群"${msg.group.name}"(${msg.group.id})开启!`)
				break;
			case "off":
				group.enable = false;
				msg.reply(`Nodecat已在群"${msg.group.name}"(${msg.group.id})关闭!`)
				break;
		}
		groups.settings[msg.group.id] = group;
	}, {
		permission: "admin",
		always: true
	});

	onExit(async () => {
		await perFm.write(JSON.stringify(per, null, 2))
		await groupsFm.write(JSON.stringify(groups, null, 2))
	})



=======
	// 加载 Permission 网络配置
	const per = readConfig("permission.json");
	NodecatConfig.Master = per.master;
	NodecatConfig.Operators = per.operators;
	if (per) console.log(`[Config] 成功加载配置: Permission`)
	
	
	
	
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
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