import fs from "fs"
import path from "path"

const util = {
	uuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0,
				v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	},
	getJsFiles(dirPath) {
		let self = this;
		let result = [];
		// 读取文件夹内容
		const files = fs.readdirSync(dirPath);
		files.forEach(file => {
			const fullPath = path.join(dirPath, file);
			const stat = fs.statSync(fullPath);
			if (stat.isDirectory()) {
				// 如果是文件夹，递归获取
				result = result.concat(self.getJsFiles(fullPath));
			} else if (stat.isFile() && path.extname(file) === '.js') {
				result.push(fullPath);
			}
		});
		return result;
	}
}

export default util;