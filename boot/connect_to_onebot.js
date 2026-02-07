import WSClient from "../code/network/websocket_client.js"
import HTTPClient from "../code/network/http_client.js"

export default (function() {
	return new Promise((resolve, reject) => {
		if (!NodecatConfig.OneBotNetwork) {
			console.error(`[Connect] 网络配置未加载`);
			return;
		}
		console.log(`[Connect] 开始连接OneBot`)
		let index = NodecatConfig.OneBotNetwork.connect;
		let network = NodecatConfig.OneBotNetwork.onebot_network[index];
		let connect;
		if (network.type === "websocket") {
			if (network.role === "server") { // OneBot实现作为服务端
				connect = new WSClient(network.url, {
					token: network.token
				})
				connect.connect(c => {
					console.log(`[Connect] 已成功连接OneBot`)
					resolve(c);
				});
				connect.autoReconnect = true;
			}
		}
	})
});