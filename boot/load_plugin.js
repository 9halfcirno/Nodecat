import manager from "../code/plugin_module/manager.js"

export default (async function() {
	await manager.scanPluginFiles()
<<<<<<< HEAD

	for (const id of manager.pluginFileMap.keys()) {
		try {
			await manager.loadPlugin(id);
		} catch (e) {
			console.error(`[Plugin] ${e.message}`)
		}
=======
	await manager.indexPlugins();

	for (const id of manager.pluginFileMap.keys()) {
		await manager.loadPluginById(id);
>>>>>>> 1c993640f61e20dd60031e9162ff3b89337f4946
	}
	return manager;
})