const https = require("https")
const querystring = require("querystring")

const network = {
	get(url, opts) {
		return new Promise((resolve, reject) => {
			https.get(url, res => {
				let data = ""
				res.on("data", chunk => data += chunk)
				res.on("end", () => resolve(data))
			}).on("error", err => reject(err))
		})
	},
	post(url, data, opts = {}) {
		return new Promise((resolve, reject) => {
			// 处理请求选项
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': opts.headers?.['Content-Type'] || 'application/json',
					...opts.headers
				}
			}

			// 如果URL是字符串，转换为URL对象
			const urlObj = typeof url === 'string' ? new URL(url) : url

			// 合并URL对象中的hostname和port
			options.hostname = urlObj.hostname
			options.port = urlObj.port || 443
			options.path = urlObj.pathname + urlObj.search

			// 根据Content-Type处理数据格式
			let postData
			if (options.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
				postData = querystring.stringify(data)
			} else if (options.headers['Content-Type'] === 'application/json') {
				postData = JSON.stringify(data)
			} else if (typeof data === 'string') {
				postData = data
			} else {
				postData = data.toString()
			}

			// 添加Content-Length头部
			options.headers['Content-Length'] = Buffer.byteLength(postData)

			const req = https.request(options, (res) => {
				let responseData = ""

				res.on("data", chunk => {
					responseData += chunk
				})

				res.on("end", () => {
					// 可以选择返回完整的响应对象或只返回数据
					const response = {
						statusCode: res.statusCode,
						headers: res.headers,
						data: responseData
					}
					resolve(response)
				})
			})

			req.on("error", err => {
				reject(err)
			})

			// 写入请求体数据
			req.write(postData)
			req.end()
		})
	}
}


module.exports = network;