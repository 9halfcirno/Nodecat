import fs from "fs";
import fsp from "fs/promises";
import path from "path";

export default class FileManager {
	constructor(filePath) {
		this.filePath = path.resolve(filePath);
		this.dir = path.dirname(this.filePath);
		this.tmpPath = this.filePath + ".tmp";

		// 进程内异步串行队列
		this._queue = Promise.resolve();
	}

	/* ======================
	 * 内部工具
	 * ====================== */

	_enqueue(task) {
		this._queue = this._queue.then(task, task);
		return this._queue;
	}

	async _ensureDir() {
		// ⭐ 异步递归创建目录（关键点）
		await fsp.mkdir(this.dir, {
			recursive: true
		});
	}

	_ensureDirSync() {
		fs.mkdirSync(this.dir, {
			recursive: true
		});
	}

	/* ======================
	 * 同步 API
	 * ====================== */

	existsSync() {
		return fs.existsSync(this.filePath);
	}

	readSync(encoding = "utf8") {
		try {
			return fs.readFileSync(this.filePath, encoding);
		} catch (e) {
			if (e.code === "ENOENT") {
				return null; // ⭐ 不存在 = null
			}
			throw e;
		}
	}

	writeSync(data, encoding = "utf8") {
		this._ensureDirSync();

		const fd = fs.openSync(this.tmpPath, "w");
		try {
			fs.writeFileSync(fd, data, encoding);
			fs.fsyncSync(fd);
		} finally {
			fs.closeSync(fd);
		}

		fs.renameSync(this.tmpPath, this.filePath);
	}

	/* ======================
	 * 异步 API（原子 + 自动建目录）
	 * ====================== */

	async exists() {
		return this._enqueue(async () => {
			try {
				await fsp.access(this.filePath);
				return true;
			} catch {
				return false;
			}
		});
	}

	async read(encoding = "utf8") {
		return this._enqueue(async () => {
			try {
				return await fsp.readFile(this.filePath, encoding);
			} catch (e) {
				if (e.code === "ENOENT") {
					return null; // ⭐ 不存在 = null
				}
				throw e;
			}
		});
	}

	async write(data, encoding = "utf8") {
		return this._enqueue(async () => {
			// ⭐ 这里已经保证目录存在
			await this._ensureDir();

			const fh = await fsp.open(this.tmpPath, "w");
			try {
				await fh.writeFile(data, encoding);
				await fh.sync();
			} finally {
				await fh.close();
			}

			// ⭐ 原子替换
			await fsp.rename(this.tmpPath, this.filePath);
		});
	}

	async delete() {
		return this._enqueue(async () => {
			try {
				await fsp.unlink(this.filePath);
			} catch (e) {
				if (e.code !== "ENOENT") throw e;
			}
		});
	}
}