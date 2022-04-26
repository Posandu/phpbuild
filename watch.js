/**
 * The watcher 👀
 */
import nodemon from "nodemon";
import chalk from "chalk";
import { WebSocketServer } from "ws";

const PORT = 5426;

nodemon({
	script: "index.js",
	ext: "js json scss css html png jpg jpeg svg php",
	watch: "src",
});

const wss = new WebSocketServer({ port: PORT });

async function createWS() {
	return new Promise((resolve, reject) => {
		wss.on("connection", function connection(ws) {
			console.log(chalk.red("WebSocket connected"));
			return resolve(ws);
		});
	});
}

const sock = await createWS();

const look = () => {
	console.log(chalk.red("Watching for changes..."));
	sock.send("reset");
};

look();

nodemon
	.on("start", function () {
		console.log(chalk.green("Watching has started..."));
		look();
	})
	.on("quit", function () {
		console.log(chalk.green("Watching has stopped..."));
		process.exit();
	})
	.on("restart", function (files) {
		console.log(chalk.green("Restarting..."));
		look();
	});
