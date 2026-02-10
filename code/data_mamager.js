import FM from "./file_manager.js";
import DM from "./data_map.js";
import onExit from "./on_exit.js"

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
				`[Data Manager] 读取 Part "${part}" 失败: ${err.message}`
			);
		}

		this.parts.set(part, {
			dm,
			fm,
			part
		});
		return dm;
	},

	async close(part) {
		if (!this.parts.has(part)) throw new Error(`[Data Manager] Part "${part}" 未被打开过`);
		await this.save(part);
		this.parts.delete(part);
	},

	get(part) {
		const entry = this.parts.get(part);
		if (!entry) {
			console.warn(`[Data Manager] Part "${part}" 未被打开过`);
			return undefined;
		}
		return entry.dm;
	},

	async save(part) {
		const entry = this.parts.get(part);
		if (!entry) {
			console.warn(`[Data Manager] Part "${part}" 未打开，无法保存`);
			return this;
		}

		const json = entry.dm.toJSONString();
		await entry.fm.write(json);

		return this;
	},

	async saveAll() {
		const tasks = [];

		for (const {
				dm,
				fm
			}
			of this.parts.values()) {
			tasks.push(fm.write(dm.toJSONString()));
		}

		await Promise.all(tasks);
		return this;
	}
};

onExit(async () => {
	console.log(`[Data Manager] 正在保存数据`)
	await DataManager.saveAll();
})

export default DataManager;