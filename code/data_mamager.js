import FM from "./file_manager.js";
import DM from "./data_map.js";
import onExit from "./on_exit.js"
<<<<<<< HEAD
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
=======

const DataManager = {
	// <part, { dm, fm, path }>
	parts: new Map(),

	/**
	 * 异步打开一个 Part
	 * - 自动读取 JSON
	 * - 自动 fromJSON
	 */
	async open(part) {
		if (this.parts.has(part)) {
			throw new Error(`[Data Manager] 已存在该 Part: ${part}`);
		}

		const fm = new FM("./storage/data/" + part + ".json");
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946

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
<<<<<<< HEAD
				`[Data Manager] 读取 file "${file}" 失败: ${err.message}`
			);
		}

		this.files.set(file, {
			dm,
			fm,
			file
=======
				`[Data Manager] 读取 Part "${part}" 失败: ${err.message}`
			);
		}

		this.parts.set(part, {
			dm,
			fm,
			part
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
		});
		return dm;
	},

<<<<<<< HEAD
	async close(file) {
		if (!this.files.has(file)) throw new Error(`[Data Manager] file "${file}" 未被打开过`);
		await this.save(file);
		this.files.delete(file);
	},

	get(file) {
		const entry = this.files.get(file);
		if (!entry) {
			console.warn(`[Data Manager] file "${file}" 未被打开过`);
=======
	async close(part) {
		if (!this.parts.has(part)) throw new Error(`[Data Manager] Part "${part}" 未被打开过`);
		await this.save(part);
		this.parts.delete(part);
	},

	get(part) {
		const entry = this.parts.get(part);
		if (!entry) {
			console.warn(`[Data Manager] Part "${part}" 未被打开过`);
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
			return undefined;
		}
		return entry.dm;
	},

<<<<<<< HEAD
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
=======
	async save(part) {
		const entry = this.parts.get(part);
		if (!entry) {
			console.warn(`[Data Manager] Part "${part}" 未打开，无法保存`);
			return this;
		}

		const json = entry.dm.toJSONString();
		await entry.fm.write(json);
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946

		return this;
	},

	async saveAll() {
		const tasks = [];

		for (const {
				dm,
				fm
			}
<<<<<<< HEAD
			of this.files.values()) {
			if (dm.size() > 0) tasks.push(fm.write(dm.toJSONString()));
=======
			of this.parts.values()) {
			tasks.push(fm.write(dm.toJSONString()));
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
		}

		await Promise.all(tasks);
		return this;
	}
};

<<<<<<< HEAD
new Cron.Job(`*/5 * * * *`, () => {
	console.log(`[Data Manager] 正在保存数据`)
	DataManager.saveAll();
})

=======
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
onExit(async () => {
	console.log(`[Data Manager] 正在保存数据`)
	await DataManager.saveAll();
})

export default DataManager;