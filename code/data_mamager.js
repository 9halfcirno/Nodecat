import FM from "./file_manager.js";
import DM from "./data_map.js";
import onExit from "./on_exit.js"
import Cron from "./cron.js"

const DataManager = {
	// <file, { dm, fm, path }>
	files: new Map(),

	/**
	 * 异步打开一个 file
	 * - 自动读取 JSON
	 * - 自动 fromJSON
	 */
	async open(file) {
		if (this.files.has(file)) {
			throw new Error(`[Data Manager] 已存在该 file: ${file}`);
		}

		const fm = new FM(file);

		let dm;
		try {
			const json = await fm.read(); // 不存在应返回 null / undefined
			if (json != null) {
				dm = DM.fromJSON(json);
			} else {
				dm = new DM();
			}
		} catch (err) {
			throw new Error(
				`[Data Manager] 读取 file "${file}" 失败: ${err.message}`
			);
		}

		this.files.set(file, {
			dm,
			fm,
			file
		});
		return dm;
	},

	async close(file) {
		if (!this.files.has(file)) throw new Error(`[Data Manager] file "${file}" 未被打开过`);
		await this.save(file);
		this.files.delete(file);
	},

	get(file) {
		const entry = this.files.get(file);
		if (!entry) {
			console.warn(`[Data Manager] file "${file}" 未被打开过`);
			return undefined;
		}
		return entry.dm;
	},

	async save(file) {
		const entry = this.files.get(file);
		if (!entry) {
			console.warn(`[Data Manager] file "${file}" 未打开，无法保存`);
			return this;
		}

		if (entry.dm.size() > 0) {
			const json = entry.dm.toJSONString();
			await entry.fm.write(json);
		}

		return this;
	},

	async saveAll() {
		const tasks = [];

		for (const {
				dm,
				fm
			}
			of this.files.values()) {
			if (dm.size() > 0) tasks.push(fm.write(dm.toJSONString()));
		}

		await Promise.all(tasks);
		return this;
	}
};

new Cron.Job(`*/5 * * * *`, () => {
	console.log(`[Data Manager] 正在保存数据`)
	DataManager.saveAll();
})

onExit(async () => {
	console.log(`[Data Manager] 正在保存数据`)
	await DataManager.saveAll();
})

export default DataManager;