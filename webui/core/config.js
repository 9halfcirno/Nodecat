import fs from "fs/promises";
import path from "path";

const CONFIG_DIR = path.resolve("./config");

function safePath(file) {

	const filePath = path.join(CONFIG_DIR, file);

	if (!filePath.startsWith(CONFIG_DIR)) {
		throw new Error("invalid path");
	}

	return filePath;
}

export async function readConfig(file) {

	const filePath = safePath(file);

	const data = await fs.readFile(filePath, "utf8");

	return JSON.parse(data);

}

export async function writeConfig(file, data) {

	const filePath = safePath(file);

	await fs.writeFile(
		filePath,
		JSON.stringify(data, null, 2)
	);

}

export async function updateKey(file, key, value) {

	const config = await readConfig(file);

	config[key] = value;

	await writeConfig(file, config);

	return config;

}