import manager from "../code/plugin_module/manager.js"

export default (async function() {
	await manager.scanPluginFiles()
	await manager.indexPlugins();

	for (const id of manager.pluginFileMap.keys()) {
		await manager.loadPluginById(id);
	}
	return manager;
})