const fs = require('fs');
const path = require('path');

/* ---------------------------------------------------------
 * FileManager
 * --------------------------------------------------------- */

class FileManager {
	constructor(filePath) {
		this.filePath = path.resolve(filePath);
		this.encoding = 'utf8';
	}

	async exists() {
		try {
			await fs.promises.access(this.filePath);
			return true;
		} catch {
			return false;
		}
	}

	async read(encoding = this.encoding) {
		try {
			return await fs.promises.readFile(this.filePath, encoding);
		} catch (e) {
			throw new Error(`读取失败: ${e.message}`);
		}
	}

	readSync(encoding = this.encoding) {
		try {
			return fs.readFileSync(this.filePath, encoding);
		} catch (e) {
			throw new Error(`读取失败: ${e.message}`);
		}
	}

	async write(content, encoding = this.encoding) {
		try {
			await fs.promises.mkdir(path.dirname(this.filePath), {
				recursive: true
			});
			await fs.promises.writeFile(this.filePath, content, encoding);
		} catch (e) {
			throw new Error(`写入失败: ${e.message}`);
		}
	}

	writeSync(content, encoding = this.encoding) {
		try {
			fs.mkdirSync(path.dirname(this.filePath), {
				recursive: true
			});
			fs.writeFileSync(this.filePath, content, encoding);
		} catch (e) {
			throw new Error(`写入失败: ${e.message}`);
		}
	}

	async append(content, encoding = this.encoding) {
		try {
			await fs.promises.mkdir(path.dirname(this.filePath), {
				recursive: true
			});
			await fs.promises.appendFile(this.filePath, content, encoding);
		} catch (e) {
			throw new Error(`追加失败: ${e.message}`);
		}
	}

	async delete() {
		try {
			await fs.promises.unlink(this.filePath);
		} catch (e) {
			if (e.code !== "ENOENT") throw new Error(`删除失败: ${e.message}`);
		}
	}

	async getStats() {
		try {
			return await fs.promises.stat(this.filePath);
		} catch (e) {
			throw new Error(`获取文件信息失败: ${e.message}`);
		}
	}

	async getSize() {
		return (await this.getStats()).size;
	}

	async rename(newPath) {
		const newFull = path.resolve(newPath);
		try {
			await fs.promises.rename(this.filePath, newFull);
			this.filePath = newFull;
		} catch (e) {
			throw new Error(`重命名失败: ${e.message}`);
		}
	}

	async copy(targetPath) {
		const full = path.resolve(targetPath);
		try {
			await fs.promises.mkdir(path.dirname(full), {
				recursive: true
			});
			await fs.promises.copyFile(this.filePath, full);
		} catch (e) {
			throw new Error(`复制失败: ${e.message}`);
		}
	}

	watch(callback) {
		return fs.watch(this.filePath, (type, filename) => callback(type, filename));
	}

	setEncoding(e) {
		this.encoding = e;
	}
	getFilePath() {
		return this.filePath;
	}
	getFileName() {
		return path.basename(this.filePath);
	}
	getFileExtension() {
		return path.extname(this.filePath);
	}
	getFileDir() {
		return path.dirname(this.filePath);
	}
}

/* ---------------------------------------------------------
 * DataManager
 * --------------------------------------------------------- */

class DataManager {
	constructor(filePath) {
		this.filePath = filePath;
		this.fileManager = new FileManager(filePath);

		// 初始化 dataMap
		let content = "{}";

		try {
			if (this.fileManager.exists()) {
				content = this.fileManager.readSync();
			}
		} catch {
			// ignore，无文件就初始化
			this.fileManager.writeSync("{\"data\":[]}");
		}

		let json;
		try {
			json = JSON.parse(content);
		} catch {
			json = {};
		}

		// json.data 是 [["key", {...}], ...]
		this.dataMap = new Map(json.data || []);
	}

	/* ----------- KV 设置 ----------- */

	setKey(key, value, properties = {}) {
		const old = this.dataMap.get(key);

		if (old && old.properties && old.properties.writable === false) {
			return false; // 不允许修改
		}

		this.dataMap.set(key, {
			value,
			properties: {
				private: false,
				writable: true,
				maxTime: null,
				...properties
			}
		});

		return true;
	}

	getKey(key) {
		const obj = this.dataMap.get(key);
		if (!obj) return undefined;

		// 处理过期
		if (obj.properties.maxTime && Date.now() >= obj.properties.maxTime) {
			this.dataMap.delete(key);
			return undefined;
		}

		return obj.value;
	}

	deleteKey(key) {
		return this.dataMap.delete(key);
	}

	/* ----------- JSON 序列化 ----------- */

	toJSON() {
		return {
			data: [...this.dataMap.entries()]
		};
	}

	saveSync() {
		this.fileManager.writeSync(JSON.stringify(this.toJSON(), null, 2));
	}

	save() {
		return this.fileManager.write(JSON.stringify(this.toJSON(), null, 2));
	}

	/* ----------- 反序列化 ----------- */
	static parse(json) {
		const obj = typeof json === "string" ? JSON.parse(json) : json;
		const dm = new DataManager("memory://"); // 内存假路径

		dm.dataMap = new Map(obj.data || []);
		return dm;
	}
}

module.exports = DataManager;