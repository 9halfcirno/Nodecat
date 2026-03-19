// network.js
export default class Network {
	static async request(method, url, {
		headers = {},
		query = null,
		body = null,
		timeout = 15000,
		responseType = "json", // json | text | raw
		redirect = "follow"    // follow | manual | error
	} = {}) {
		// ---- 拼 query ----
		if (query && typeof query === "object") {
			const qs = new URLSearchParams(query).toString();
			if (qs) {
				url += (url.includes("?") ? "&" : "?") + qs;
			}
		}

		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeout);

		const opts = {
			method,
			headers,
			signal: controller.signal,
			redirect      // 新增：透传重定向配置
		};

		// ---- body 处理 ----
		if (body != null) {
			if (typeof body === "object" && !(body instanceof Buffer)) {
				opts.body = JSON.stringify(body);
				opts.headers["content-type"] ??= "application/json";
			} else {
				opts.body = body;
			}
		}

		try {
			const res = await fetch(url, opts);
			clearTimeout(timer);

			// 处理手动重定向的情况（3xx 且 redirect: manual）
			const isManualRedirect = redirect === "manual" && res.status >= 300 && res.status < 400;
			if (!res.ok && !isManualRedirect) {
				const text = await res.text().catch(() => "");
				throw new Error(
					`[Network] ${method} ${url} ${res.status}: ${text}`
				);
			}

			// 如果是手动重定向，直接返回原始 Response（忽略 responseType）
			if (isManualRedirect) {
				return res;
			}

			// 正常处理响应
			if (responseType === "raw") return res;
			if (responseType === "text") return await res.text();
			return await res.json();
		} catch (err) {
			if (err.name === "AbortError") {
				throw new Error(`[Network] 请求超时: ${url}`);
			}
			throw err;
		}
	}

	// ---------- GET ----------
	static get(url, options = {}) {
		return this.request("GET", url, options);
	}

	// ---------- POST ----------
	static post(url, body, options = {}) {
		return this.request("POST", url, {
			...options,
			body
		});
	}
}