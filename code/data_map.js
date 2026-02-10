class DataMap {
	#dataMap;

	constructor(initialJSON) {
		this.#dataMap = new Map();

		if (initialJSON) {
			this.loadJSON(initialJSON);
		}
	}

	/* ----------- JSON 反序列化 ----------- */

	static fromJSON(json) {
		const dm = new DataMap();
		dm.loadJSON(json);
		return dm;
	}

	loadJSON(json) {
		try {
			if (json instanceof Map) {
				this.#dataMap = new Map(json);
			} else if (Array.isArray(json)) {
				this.#dataMap = new Map(json);
			} else if (typeof json === "string") {
				const obj = JSON.parse(json);
				this.#dataMap = new Map(obj?.data || []);
			} else if (typeof json === "object") {
				this.#dataMap = new Map(json?.data || []);
			}
		} catch {
			// 数据损坏：直接清空（由外部决定是否回滚）
			this.#dataMap.clear();
		}
	}

	clear() {
		this.#dataMap.clear();
	}

	/* ----------- KV 操作 ----------- */

	set(key, value, properties = {}) {
		let old = this.#dataMap.get(key);

		// 过期检查
		let isExpired = false;
		if (old?.properties?.maxTime) {
			isExpired = Date.now() >= old.properties.maxTime;
			if (isExpired) {
				this.#dataMap.delete(key);
				old = null;
			}
		}

		// 不可写保护
		if (old?.properties?.writable === false) {
			return false;
		}

		// daily 自动计算过期时间
		if (properties.daily) {
			properties.maxTime =
				(Math.floor(Date.now() / 86400000) + 1) * 86400000;
		}

		const mergedProperties = {
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

	get(key) {
		const obj = this.#dataMap.get(key);
		if (!obj) return undefined;

		// 过期即删
		if (obj.properties?.maxTime && Date.now() >= obj.properties.maxTime) {
			this.#dataMap.delete(key);
			return undefined;
		}

		return obj.value;
	}

	has(key) {
		return this.get(key) !== undefined;
	}

	delete(key) {
		return this.#dataMap.delete(key);
	}

	/* ----------- 遍历 / 信息 ----------- */

	keys() {
		return [...this.#dataMap.keys()];
	}

	entries() {
		return [...this.#dataMap.entries()];
	}

	size() {
		return this.#dataMap.size;
	}

	/* ----------- JSON 序列化 ----------- */

	toJSON() {
		return {
			data: [...this.#dataMap.entries()]
		};
	}

	toJSONString(space = 0) {
		return JSON.stringify(this.toJSON(), null, space);
	}
}

export default DataMap;