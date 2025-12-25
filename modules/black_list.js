// TODO: fix bug

const fs = require('fs').promises;
const path = require('path');

const BLACKLIST_FILE_PATH = path.join(NodecatConfig.nodecat_run_path, 'storage/nodecat/blacklist.json');

const blackList = {
	dataMap: new Map(),

	/**
	 * 添加用户到黑名单
	 * @param {string|number} id - 用户ID
	 * @param {number} level - 黑名单等级
	 * @param {string} reason - 原因
	 */
	add(id, level, reason) {
		this.dataMap.set(String(id), {
			level,
			reason
		});
	},

	/**
	 * 从黑名单移除用户
	 * @param {string|number} id - 用户ID
	 * @returns {boolean} 是否移除成功
	 */
	remove(id) {
		return this.dataMap.delete(String(id));
	},

	/**
	 * 检查用户是否在黑名单中
	 * @param {string|number} id - 用户ID
	 * @returns {boolean}
	 */
	has(id) {
		return this.dataMap.has(String(id));
	},

	/**
	 * 设置黑名单等级
	 * @param {string|number} id - 用户ID
	 * @param {number} level - 新的等级
	 * @returns {boolean} 是否设置成功
	 */
	setLevel(id, level) {
		const userData = this.dataMap.get(String(id));
		if (userData) {
			userData.level = level;
			return true;
		}
		return false;
	},

	/**
	 * 获取黑名单等级
	 * @param {string|number} id - 用户ID
	 * @returns {number|null} 等级，如果用户不存在则返回null
	 */
	getLevel(id) {
		const userData = this.dataMap.get(String(id));
		return userData ? userData.level : null;
	},

	/**
	 * 获取加入黑名单的原因
	 * @param {string|number} id - 用户ID
	 * @returns {string|null} 原因，如果用户不存在则返回null
	 */
	getReason(id) {
		const userData = this.dataMap.get(String(id));
		return userData ? userData.reason : null;
	},

	/**
	 * 从文件加载黑名单数据
	 * @returns {Promise<void>}
	 */
	async _loadBlackList() {
		try {
			const fileContent = await fs.readFile(BLACKLIST_FILE_PATH, 'utf-8');
			const data = JSON.parse(fileContent);

			if (data.black && Array.isArray(data.black)) {
				this.dataMap = new Map(data.black.map(item => {
					const [id, userData] = item;
					return [String(id), userData];
				}));
			}
		} catch (error) {
			// 如果文件不存在，则创建空的黑名单
			if (error.code === 'ENOENT') {
				await this.save();
			} else {
				console.error('加载黑名单失败:', error);
			}
		}
	},

	/**
	 * 保存黑名单到文件
	 * @returns {Promise<void>}
	 */
	async save() {
		try {
			// 将Map转换为可序列化的数组
			const blackArray = Array.from(this.dataMap.entries()).map(([id, userData]) => {
				return [String(id), userData];
			});

			const data = {
				black: blackArray
			};

			await fs.writeFile(
				BLACKLIST_FILE_PATH,
				JSON.stringify(data, null, 2),
				'utf-8'
			);
		} catch (error) {
			console.error('保存黑名单失败:', error);
			throw error;
		}
	},
	
	saveSync() {
		try {
			// 将Map转换为可序列化的数组
			const blackArray = Array.from(this.dataMap.entries()).map(([id, userData]) => {
				return [String(id), userData];
			});

			const data = {
				black: blackArray
			};

			fs.writeFileSync(
				BLACKLIST_FILE_PATH,
				JSON.stringify(data, null, 2),
				'utf-8'
			);
		} catch (error) {
			console.error('保存黑名单失败:', error);
			throw error;
		}
	}
};

module.exports = blackList;