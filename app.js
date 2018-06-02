// modules
const electron = require("electron");
const ipc = require('electron').ipcMain;
const url = require("url");
const path = require("path");

// main app
const {app, BrowserWindow, Menu} = electron;

// app windows
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
});

// create select directory window
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

	// garbage collecton
	selectDirWindow.on("close", function(){
		selectDirWindow = null;
	});

	// remove menu
	selectDirWindow.setMenu(null);
}

// menu template
const mainMenuTemplate = [
	{	// Menu item 1: Select Directory
		label: "Select Directory",
		// keyboard shortcut
		accelerator: process.platform == "darwin" ? "Command+S" : "Ctrl+S",
		// open window on click
		click() {
			createSelectDirWindow();
		}
	},
	{	// Menu item 2: Select Directory
		label: "Quit Application",
		// keyboard shortcut
		accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
		// quit app on click
		click() {
			app.quit();
		}
	}
];

// if mac, add empty object to fix menu bug
if (process.platform == "darwin") {
	mainMenuTemplate.unshift({});
}

// add developer tools if not in production
if (process.env.NODE_ENV != "production") {
	mainMenuTemplate.push({
		label: "Developer Tools",
		submenu: [
			{	// toggle dev tools
				label: "Toggle Developer Tools",
				accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
				}
			},
			{	// reload app
				role: "reload"
			}
		]
	});
}