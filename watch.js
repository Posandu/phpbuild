/**
 * The watcher 👀
 */
import chokidar from "chokidar";
import path from "path";
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { run } from "./index.js";

import { hashElement } from "folder-hash";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "src");

const app = express();
const port = 5426;

let sendData = "";

const getHash = async () => {
	return new Promise((resolve, reject) => {
		hashElement(srcDir, {
			algorithm: "md5",
			encoding: "hex",
		}).then((hash) => {
			resolve(hash);
		});
	});
};

app.get("/", (req, res) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	res.header("Access-Control-Allow-Headers", "Content-Type");
	res.send(sendData);
});

app.listen(port, () => {});

chokidar.watch(srcDir).on("change", async (event, path) => {
	sendData = await getHash();
	run();
});
