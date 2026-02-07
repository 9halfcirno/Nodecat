import PluginManager from "../code/plugin_module/manager.js"

export default (async function() {
	const manager = new PluginManager();
	
	await manager.scanPluginFiles()
	for (const url of manager.pluginFiles) {
		await manager.loadPlugin(url);
	}
	return manager;
})