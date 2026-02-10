// network.js
export default class Network {
	static async request(method, url, {
		headers = {},
		query = null,
		body = null,
		timeout = 15000,
		responseType = "json" // json | text | raw
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
			signal: controller.signal
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

			if (!res.ok) {
				const text = await res.text().catch(() => "");
				throw new Error(
					`[Network] ${method} ${url} ${res.status}: ${text}`
				);
			}

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