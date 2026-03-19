import manager from "../code/plugin_module/manager.js"

export default (async function() {
	await manager.scanPluginFiles()

	for (const id of manager.pluginFileMap.keys()) {
		try {
			await manager.loadPlugin(id);
		} catch (e) {
			console.error(`[Plugin] ${e.message}`)
		}
	}
	return manager;
})