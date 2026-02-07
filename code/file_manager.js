import fs from "fs";
const fsp = fs.promises;
import path from "path";

class FileManager {
	constructor(filePath) {
		this.filePath = path.resolve(filePath);
		this.dir = path.dirname(this.filePath);
		this.tmpPath = this.filePath + ".tmp";

		// 进程内异步串行锁
		this._queue = Promise.resolve();
	}

	/* ======================
	 * 内部工具
	 * ====================== */

	_enqueue(task) {
		this._queue = this._queue.then(task, task);
		return this._queue;
	}

	_ensureDirSync() {
		// ⭐ 目录不存在就递归创建
		fs.mkdirSync(this.dir, {
			recursive: true
		});
	}

	async _ensureDir() {
		// ⭐ 目录不存在就递归创建
		await fsp.mkdir(this.dir, {
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
		return fs.readFileSync(this.filePath, encoding);
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

		// ⭐ 原子替换
		fs.renameSync(this.tmpPath, this.filePath);
	}

	deleteSync() {
		try {
			fs.unlinkSync(this.filePath);
		} catch (e) {
			if (e.code !== "ENOENT") throw e;
		}
	}

	/* ======================
	 * 异步 API（原子 + 串行）
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
			return fsp.readFile(this.filePath, encoding);
		});
	}

	async write(data, encoding = "utf8") {
		return this._enqueue(async () => {
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

export default FileManager;