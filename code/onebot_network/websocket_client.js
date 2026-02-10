import onebotV11 from "../onebot v11.js";
import Client from "./client.js";
import onExit from "../on_exit.js";

class WebsocketClient extends Client {
	constructor(url, opts = {}) {
		super(url);
		this.connection = null;

		this.token = opts.token || null;
		this.websocket = null;
		this.status = WebsocketClient.DISCONNECTED;

		this.onconnectHandlers = [];
		this.oncloseHandlers = [];
		this.onmessageHandlers = [];

		this.autoReconnect = false;
		
		onExit(() => {
			if (this.status === WebsocketClient.CONNECTED) {
				console.log(`[WebSocket] 正在关闭连接`)
				this.disconnect();
			}
		})
	}

	connect(callback) {
		if (this.status !== WebsocketClient.DISCONNECTED) {
			throw new Error('[WebSocket Client] Client is already connecting or connected.');
		}
		this.status = WebsocketClient.CONNECTING;
		this.websocket = new WebSocket(this.url, {
			headers: {
				Authorization: `Bearer ${this.token}`
			}
		});

		console.log('[WebSocket Client] Connecting to', this.url);

		this.websocket.onopen = () => {
			this.status = WebsocketClient.CONNECTED;
			console.log('[WebSocket Client] Connected to', this.url);
			this.websocket.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (!data) {
					console.error('[WebSocket Client] Received invalid message:', event.data);
					return;
				}
				if (data.status === "failed") {
					console.error(`[WebSocket Client] 无法与OneBot服务端建立连接: ${data.message} (code: ${data.code})`);
					// Napcat 会自己断开连接
				} else if (
					data.post_type === onebotV11.EventType.META &&
					data.meta_event_type === "lifecycle" &&
					data.sub_type === "connect"
				) {
					console.log(`[WebSocket Client] 已成功与OneBot服务端建立连接`);
					NodecatConfig.Bot.QQ = data.self_id;
					//console.log(`[WebSocket Client] 开始监听消息`);
					this.onconnectHandlers.forEach(handler => handler());
					callback && callback(this);
					this.websocket.onmessage = (event => {
						/**
						 * @type {Object} Napcat那边发过来的消息
						 */
						const messageData = JSON.parse(event.data);

						this.onmessageHandlers.forEach(handler => handler(messageData));
					});
				}
			}
		}
		this.websocket.onclose = () => {
			this.status = WebsocketClient.DISCONNECTED;
			console.log('[WebSocket Client] Disconnected from', this.url);
			this.oncloseHandlers.forEach(handler => handler());
			if (this.autoReconnect) {
				console.log(`[WebSocket Client] 将在5s后重连`);
				setTimeout(() => this.connect(), 5000);
			}
		}
		this.websocket.onerror = (error) => {
			console.error(`[WebSocket Client] WebSocket error:`, error);
		}
	}

	disconnect() {
		this.autoReconnect = false;
		if (this.status !== WebsocketClient.CONNECTED) {
			throw new Error('[WebSocket Client] Client is not connected.');
		}
		this.status = WebsocketClient.DISCONNECTING;
		this.websocket.close();
	}

	onMessage(handler) {
		this.onmessageHandlers.push(handler);

	}

	onConnect(handler) {
		this.onconnectHandlers.push(handler);
	}

	onClose(handler) {
		this.oncloseHandlers.push(handler);
	}

	send(data) {
		if (this.status !== WebsocketClient.CONNECTED) {
			throw new Error('[WebSocket Client] Client is not connected.');
		}
		this.websocket.send(JSON.stringify(data));
	}
}

WebsocketClient.DISCONNECTED = 0;
WebsocketClient.CONNECTING = 1;
WebsocketClient.CONNECTED = 2;
WebsocketClient.DISCONNECTING = 3;

export default WebsocketClient;