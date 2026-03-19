(async function() {
	const response = await fetch("http://localhost:3000/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json" // 明确告诉服务器发送的是 JSON
		},
		body: JSON.stringify({
			password: "nodecat"
		})
	});
	const data = await response.json(); // 解析返回的 JSON
	console.log(data);
})();