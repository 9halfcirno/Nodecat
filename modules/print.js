// 格式化时间，用于显示
function tF() {
	let ms = Date.now();
	const totalSeconds = Math.floor(ms / 1000);
	const SECS_DAY = 86400;
	const s = ((totalSeconds % SECS_DAY) + SECS_DAY) % SECS_DAY;
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	return `[${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}]`;
}

const print = {
	log(...args) {
		console.log(tF() + "[\033[32mINFO\033[0m]", ...args)
	},
	warn(...args) {
		console.warn(tF() + "[\033[33mWARN\033[0m]", ...args)
	},
	error(...args) {
		console.error(tF() + "[\033[31mERROR\033[0m]", ...args)
	},
	debug(...args) {
		console.log(tF() + "[\033[34mDEBUG\033[0m]", ...args)
	},
}

module.exports = print