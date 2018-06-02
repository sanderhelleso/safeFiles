const electron = require("electron");
const ipc = require('electron').ipcMain;
const url = require("url");
const path = require("path");

const {app, BrowserWindow, Menu} = electron;

let mainWindow;
let selectDirWindow;

// listen for app to be ready
app.on("ready", function() {

	// create new window
	mainWindow = new BrowserWindow({});

	// load html into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, "mainWindow.html"),
		protocol: "file:",
		slashes: true
	}));

	// set app menu
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);
})

function createSelectDirWindow() {
	// create new window
	selectDirWindow = new BrowserWindow({
		window: 350,
		height: 450,
		title: "Select directory"
	});

	// load html into window
	selectDirWindow.loadURL(url.format({
		pathname: path.join(__dirname, "selectDirWindow.html"),
		protocol: "file:",
		slashes: true
	}));
}

// menu template
const mainMenuTemplate = [
	{
		label: "Select Directory",
	}
];