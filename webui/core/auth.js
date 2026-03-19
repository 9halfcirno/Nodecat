import crypto from "crypto";
import {
	readConfig
} from "./config.js";

const tokens = new Map();

const loginAttempts = new Map();

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 10 * 60 * 1000;



export async function login(password, ip = "0.0.0.0") {
	
	const config = await readConfig("webui.json");

	const attempt = loginAttempts.get(ip);

	if (attempt && attempt.count >= MAX_ATTEMPTS) {

		if (Date.now() - attempt.time < BLOCK_TIME) {
			throw new Error("too many attempts");
		}

		loginAttempts.delete(ip);

	}
	if (password !== config.password) {

		const record = loginAttempts.get(ip) || {
			count: 0
		};

		record.count++;
		record.time = Date.now();

		loginAttempts.set(ip, record);

		throw new Error("invalid login");

	}

	const token = crypto.randomBytes(32).toString("hex");

	tokens.set(token, {
		expire: Date.now() + config.tokenExpire * 1000
	});

	return token;

}



export function verifyToken(token) {

	const data = tokens.get(token);

	if (!data) return false;

	if (Date.now() > data.expire) {

		tokens.delete(token);

		return false;

	}

	return true;

}



export function authMiddleware(req, res, next) {

	const token = req.headers["token"];

	if (!verifyToken(token)) {

		res.status(401).json({
			error: "unauthorized"
		});

		return;
	}

	next();

}