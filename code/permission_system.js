import Command from "./command_manager.js"
import fm from "./file_manager.js";

const permission = [ // 权限，越靠后越nb
	"member",
	"admin",
	"owner",
	"operator",
	"master"
];

export default {
	level(role) {
		if (typeof role === "number") return role;
		return permission.indexOf(role) || 0;
	},

	permissionOf(id) {
		if (NodecatConfig.Master == id) return "master";
		if (NodecatConfig.Operators.includes(id)) return "operator";
		return "member"; // 默认
	},

	isMember(role) {
		if (typeof role === "string") return this.level(role) >= permission.indexOf("member");
		return this.level(role.role) >= permission.indexOf("member");
	},

	isAdmin(role) {
		if (typeof role === "string") return this.level(role) >= permission.indexOf("admin");
		return this.level(role.role) >= permission.indexOf("admin");
	},

	isOwner(role) {
		if (typeof role === "string") return this.level(role) >= permission.indexOf("owner");
		return this.level(role.role) >= permission.indexOf("owner");
	},

	isOperator(role) {
		if (typeof role === "string") return this.level(role) >= permission.indexOf("operator");
		return this.level(role.role) >= permission.indexOf("operator");
	},

	isMaster(role) {
		if (typeof role === "string") return this.level(role) >= permission.indexOf("master");
		return this.level(role.role) >= permission.indexOf("master");
	}
};


