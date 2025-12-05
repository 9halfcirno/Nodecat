const path = require("path")
const fs = require("fs")

const util = {
	parseJSON(e) {
		try {
			return JSON.parse(e)
		} catch {
			return undefined
		}
	},
	isJSON(j) {
		try {
			JSON.parse(j);
			return true;
		} catch (e) {
			return false;
		}
	},
	uEcho() {
		return Date.now() + "#" + Math.random().toString(36).substr(2)
	},
	uuid(len, radix) {
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		var uuid = [],
			i;
		radix = radix || chars.length;
		if (len) {
			for (i = 0; i < len; i++) uuid[i] = chars[0 || Math.random() * radix];
		} else {
			var r;
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random() * 16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
		}
		return uuid.join('');
	},
	getJsFiles(dirPath) {
		let result = [];
		// 读取文件夹内容
		const files = fs.readdirSync(dirPath);
		files.forEach(file => {
			const fullPath = path.join(dirPath, file);
			const stat = fs.statSync(fullPath);
			if (stat.isDirectory()) {
				// 如果是文件夹，递归获取
				result = result.concat(getJsFiles(fullPath));
			} else if (stat.isFile() && path.extname(file) === '.js') {
				result.push(fullPath);
			}
		});
		return result;
	}
}
module.exports = util;