const electron = require("electron");
const { spawn } = require("child_process");
const chalk = require("chalk");

function electronLog(data, color) {
	let log = "";
	data = data.toString().split(/\r?\n/);
	data.forEach(line => {
		log += `  ${line}\n`;
	});
	if (/[0-9A-z]+/.test(log)) {
		console.log(
			chalk[color].bold("┏ Electron -------------------") +
				"\n\n" +
				log +
				chalk[color].bold("┗ ----------------------------") +
				"\n"
		);
	}
}

function startElectron() {
	const electronProcess = spawn(electron, ["."]);

	electronProcess.stdout.on("data", data => {
		electronLog(data, "blue");
	});
	electronProcess.stderr.on("data", data => {
		electronLog(data, "red");
	});

	electronProcess.on("close", () => {
		process.exit();
	});
}
module.exports.startElectron = startElectron;

// const { app, BrowserWindow } = require("electron");

// function createWindow() {
// 	const win = new BrowserWindow({
// 		width: 800,
// 		height: 600,
// 		webPreferences: {
// 			nodeIntegration: true,
// 			webSecurity: false
// 		}
// 	});
// 	console.log(process);
// 	win.loadFile("../dist/index.html");
// 	win.webContents.openDevTools();
// }

// app.whenReady().then(createWindow);

// app.on("window-all-closed", () => {
// 	if (process.platform !== "darwin") {
// 		app.quit();
// 	}
// });

// app.on("activate", () => {
// 	if (BrowserWindow.getAllWindows().length === 0) {
// 		createWindow();
// 	}
// });
