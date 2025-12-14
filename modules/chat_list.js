const ChatList = {
	groups: new Map(),
	getGroup(id) {
		return this.groups.has(id) ? this.groups.get(id) : null
	}
}