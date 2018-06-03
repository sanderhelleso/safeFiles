// enables ES6 +
'use strict'

// modules
const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs-extra");

// main app
const {app, BrowserWindow, Menu, ipcMain} = electron;

// app windows
let mainWindow;
let selectDirWindow;

// listen for app to be ready
app.on("ready", function() {

	// create new window
	mainWindow = new BrowserWindow({
		icon: path.join(__dirname + "/img/icon/deer.ico"),
		width: 1150,
		height: 600,
		frame: false,
	});

	// load html into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, "mainWindow.html"),
		protocol: "file:",
		slashes: true,
	}));

	// set app menu
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);

	// disable resizing of window
	mainWindow.setResizable(false);

	// close app and all open windows on exit
	mainWindow.on("closed", function(){
		mainWindow = null;
		app.quit();
	});
});

// create select directory window
function createSelectDirWindow() {
	// create new window
	selectDirWindow = new BrowserWindow({
		width: 800,
		height: 500,
		title: "Select directory",
		frame: false
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

	// remove menu @TODO: REMOVE BEFORE PRODUCTION, enabled for dev tools
	//selectDirWindow.setMenu(null);
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);

	// disable resizing of window
	selectDirWindow.setResizable(false);
}

/******************************************* 
catch paths sendt from selectDirWindow.html
*******************************************/
let pathFrom;
let pathTo;

// handler for from path
ipcMain.on("directoryFrom:path", function(e, path){
	pathFrom = path;
	mainWindow.webContents.send("directoryFrom:path", path);
	selectDirWindow.close();
	mainWindow.show();
});

// handler for to path
ipcMain.on("directoryTo:path", function(e, path){
	pathTo = path;
	mainWindow.webContents.send("directoryTo:path", path);

	// run copy files
	copyFiles(pathFrom, pathTo);
});

// functon to copy files from selected dirs
function copyFiles(pathFrom, pathTo) {
	// read selected from directory
	fs.readdir(pathFrom, function(err, files) {	 	
	    files.forEach(file => {
	    	// copy files from selected dirs
	    	fs.copySync(path.resolve(pathFrom, file), pathTo + "/" + file);
	    });
	});
}

/******************************************* 
get directory and display directory stats
*******************************************/
ipcMain.on("directoryFrom:dir", function(e, path){
	selectDirWindow.webContents.send("directoryFrom:dir", path);
});

ipcMain.on("directoryTo:dir", function(e, path){
	selectDirWindow.webContents.send("directoryTo:dir", path);
	console.log(path);
});

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