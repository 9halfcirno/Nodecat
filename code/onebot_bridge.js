import Client from "./network/client.js";
import util from "./util.js";

const Bridge = {
	nowConnect: null,
	connects: [],
	promises: new Map(),
	messageHandlers: [],

	setConnect(connect) {
		Bridge.connects.push(connect);
		if (!Bridge.nowConnect) Bridge.initConnect(connect);
	},

	initConnect(connect) {
		Bridge.nowConnect = connect;

		connect.onMessage((data) => {
			if (data.echo && Bridge.promises.has(data.echo)) {
				const {
					resolve,
					reject,
					timeoutId
				} = Bridge.promises.get(data.echo);
				Bridge.promises.delete(data.echo);

				clearTimeout(timeoutId);

				if (data.status === "ok") {
					resolve(data.data);
				} else {
					reject(data.message);
				}
			}

			Bridge.messageHandlers.forEach(h => h(data));
		});
	},

	send(action, params, timeout = 30000) {
		return new Promise((resolve, reject) => {
			if (!Bridge.nowConnect) {
				reject(new Error("当前未连接到OneBot"));
				return;
			}

			const echo = util.uuid();
			const msg = {
				action,
				params,
				echo
			};

			const timeoutId = setTimeout(() => {
				if (!Bridge.promises.has(echo)) return;
				Bridge.promises.delete(echo);
				reject(new Error("Time out"));
			}, timeout);

			Bridge.promises.set(echo, {
				resolve,
				reject,
				timeoutId
			});

			Bridge.nowConnect.send(msg);
		});
	},

	onMessage(handler) {
		Bridge.messageHandlers.push(handler);
	}
};

export default Bridge;