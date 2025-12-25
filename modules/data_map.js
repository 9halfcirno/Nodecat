const fs = require('fs');
const path = require('path');

/* ---------------------------------------------------------
 * FileManager
 * --------------------------------------------------------- */

class FileManager {
	constructor(filePath) {
		this.filePath = path.resolve(filePath);
		this.encoding = 'utf8';
		this.saving = false;
	}

	async exists() {
		try {
			await fs.promises.access(this.filePath);
			return true;
		} catch {
			return false;
		}
	}

	existsSync() {
		try {
			fs.accessSync(this.filePath);
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

	copySync(targetPath) {
		const full = path.resolve(targetPath);
		fs.mkdirSync(path.dirname(full), {
			recursive: true
		});
		fs.copyFileSync(this.filePath, full);
	}

	/*watch(callback) { // 有bug直接注释
		return fs.watch(this.filePath, (type, filename) => callback(type, filename));
	}*/

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
	#fileManager;
	#dataMap;

	constructor(filePath) {
		this.filePath = filePath;
		this.#fileManager = new FileManager(filePath);

		let content;

		// -------- 修正后的初始化逻辑 --------
		if (this.#fileManager.existsSync()) {
			// 文件存在：只允许读，不允许覆盖
			content = this.#fileManager.readSync();
		} else {
			// 文件不存在：初始化
			content = JSON.stringify({
				data: []
			});
			this.#fileManager.writeSync(content);
		}

		let json;
		try {
			json = JSON.parse(content);
		} catch {
			// -------- JSON 损坏：备份再覆盖 --------
			const backupPath = `${filePath}.broken_${Date.now()}`;
			try {
				this.#fileManager.copySync(backupPath);
			} catch {}

			json = {
				data: []
			};
			this.#fileManager.writeSync(JSON.stringify(json));
		}

		this.#dataMap = new Map(json.data || []);
	}

	/* ----------- KV 设置 ----------- */

	setKey(key, value, properties = {}) {
		let old = this.#dataMap.get(key);

		let isExpired = false;
		if (old && old.properties && old.properties.maxTime) {
			isExpired = Date.now() >= old.properties.maxTime;
			if (isExpired) {
				this.#dataMap.delete(key);
				old = null;
			}
		}

		if (old && old.properties && old.properties.writable === false) {
			return false;
		}

		if (properties.daily) {
			properties.maxTime = (Math.floor(Date.now() / 86400000) + 1) * 86400000;
		}

		const mergedProperties = {
			private: false,
			writable: true,
			maxTime: null,
			...((old && !isExpired) ? old.properties : {}),
			...properties
		};

		this.#dataMap.set(key, {
			value,
			properties: mergedProperties
		});

		return true;
	}

	getKey(key) {
		const obj = this.#dataMap.get(key);
		if (!obj) return undefined;

		// 你都过期了我留你干嘛，不然叫maxTime呢？
		if (obj.properties.maxTime && Date.now() >= obj.properties.maxTime) {
			this.#dataMap.delete(key);
			return undefined;
		}

		return obj.value;
	}

	deleteKey(key) {
		return this.#dataMap.delete(key);
	}

	/* ----------- JSON 序列化 ----------- */

	toJSON() {
		return {
			data: [...this.#dataMap.entries()]
		};
	}

	saveSync() {
		this.#fileManager.writeSync(JSON.stringify(this.toJSON()));
	}

	save() {
		return this.#fileManager.write(JSON.stringify(this.toJSON()));
	}
}

function getToday() {
	const d = new Date();
	return `${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
}

module.exports = DataManager;