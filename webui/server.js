import express from "express";
import path from "path";
import {
	fileURLToPath
} from "url";
import {
	login,
	authMiddleware
} from "./core/auth.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(path.join(__dirname, "public"));
const app = express();

app.get("/", (req, res) => {
	res.redirect("/public");
});

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(express.json());

app.post("/login", async (req, res) => {
	console.log(req.body)
	try {
		let token = await login(req.body.password);
		res.status(200).send({
			status: "success",
			token: token
		})
	} catch (e) {
		res.status(403).send({
			error: {
				message: e.message
			}
		})
	};
})

app.get("/login", (req, res) => {
	res.send("try POST this api")
})

// 鉴权中间件
app.use(authMiddleware);

app.use("/config", (rep, res, next) => {

})

app.listen(3000, () => {
	console.log("服务器运行在 http://localhost:3000");
});