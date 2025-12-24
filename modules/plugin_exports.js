const pluginExports = {
	exports:new Map(),
	require(id) {
		return this.exports.get(id)
	}
}

module.exports = pluginExports