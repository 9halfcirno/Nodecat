const OneBot = { // 定义之类，不是真的OneBot
	EventType: {
		META: 'meta_event', // 元事件
		REQUEST: 'request', // 请求事件
		NOTICE: 'notice', // 通知事件
		MESSAGE: 'message', // 消息事件
		MESSAGE_SENT: 'message_sent', // 消息发送事件
	},
	MetaEventType: {
		HEARTBEAT: 'heartbeat', // 心跳事件
		LIFECYCLE: 'lifecycle' // 生命周期事件
	},
	LifeCycleSubType: {
		ENABLE: 'enable', // 启用
		DISABLE: 'disable', // 禁用
		CONNECT: 'connect' // 连接
	},
	QQMessageType: {
		PRIVATE: 'private',
		GROUP: 'group'
	}
}
module.exports = OneBot;