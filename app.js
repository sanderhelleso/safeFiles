// enables ES6 +
'use strict'

// modules
const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs-extra");
const jsonBackups = getJSON();
require('events').EventEmitter.defaultMaxListeners = 0;
process.on("uncaughtException", (err) => {
	console.log(err);
});

// main app
const {app, BrowserWindow, Menu, ipcMain} = electron;

// init auto launch
autoLaunch(); // @TODO: FIX THIS!!

// app windows set as globals
let mainWindow;
let selectDirWindow;

// listen for app to be ready
app.on("ready", function() {

	// create new window
	mainWindow = new BrowserWindow({
		icon: path.join(__dirname + "/img/icon/safeFiles.ico"),
		width: 1150,
		height: 600,
		frame: false,
		show: false
	});

	// load html into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, "mainWindow.html"),
		protocol: "file:",
		slashes: true,
	}));

	// show window when loaded
	mainWindow.once("ready-to-show", () => {
		mainWindow.show()
		// create backups from JSON file
		getBackUps(jsonBackups);
	});

	// set app menu
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	Menu.setApplicationMenu(mainMenu);

	// disable resizing of window
	mainWindow.setResizable(false);

	// close app and all open windows on exit
	mainWindow.on("close", function(e){
		// save data to JSON
		saveData(e);
	});
});

// create select directory window
function createSelectDirWindow() {
	// create new window
	selectDirWindow = new BrowserWindow({
		icon: path.join(__dirname + "/img/icon/safeFiles.ico"),
		width: 800,
		height: 525,
		title: "Select directory",
		frame: false,
		show: false
	});

	// load html into window
	selectDirWindow.loadURL(url.format({
		pathname: path.join(__dirname, "selectDirWindow.html"),
		protocol: "file:",
		slashes: true
	}));

	// show window when loaded
	selectDirWindow.once("ready-to-show", () => {
		selectDirWindow.show()
	});

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
	mainWindow.webContents.send("directoryFrom:path", pathFrom);
	selectDirWindow.close();
	mainWindow.show();
});

// handler for to path
ipcMain.on("directoryTo:path", function(e, path) {
	pathTo = path[0];
	mainWindow.webContents.send("directoryTo:path", path);

	if (path[1] != "watch") {
		// run copy files with from path, to path and the amount of millisecs
		let newBackup = copyFiles(pathFrom, pathTo, parseInt(path[1]) * 1000, backupCount, parseInt(path[1]) * 1000);
		backups.push(newBackup);
		backupCount++;
	}

	else {
		// run file watcher
		fileWatcher(pathFrom, pathTo);

		// add to param counter
		backupsParams.push([pathFrom, pathTo]);
	}
});

// stop backup
ipcMain.on("stopBackUp:nr", function(e, nr) {
	// stop the selected backup
	clearInterval(backups[nr]);
});

// start backup
ipcMain.on("startBackUp:nr", function(e, nr) {
	// start selected backup and pass inn "stopped" to revert back in interval
	backups[parseInt(nr[2])] = copyFiles(nr[0], nr[1], nr[3], parseInt(nr[2]), nr[4], true);
});

// functon to copy files from selected dirs, run on parameter millisecs
let backupCount = 0;
let backups = [];
let backupsParams = [];
function copyFiles(pathFrom, pathTo, millisecs, backupNr, original, stopped) {
	// calculate correct time when pausing / starting a backup
	backupsParams[backupNr] = [pathFrom, pathTo, millisecs, backupNr, original, stopped];
	return setInterval(function() {
		console.log(millisecs);
		console.log("Copyed a file at: " + new Date());
		// read selected from directory
		fs.readdir(pathFrom, function(err, files) {
			if (err) {
				console.log(err); // @TODO: add some error handling here
				throw err;
			}

			// go through every file in selected dir
	    	files.forEach(file => {
	    		// copy files from selected dir to selected dir
	    		fs.copySync(path.resolve(pathFrom, file), pathTo + "/" + file);
	    	});
		});

		// if the countdown has been stopped, reset to original value when modified interval is done
		if (stopped) {
			// stop current interval
			clearInterval(backups[backupNr]);

			// replace with new with new values
			backups[backupNr] = copyFiles(pathFrom, pathTo, original, backupNr, original, false);

			// send original value to main
			mainWindow.webContents.send("setOriginal:timer", backupsParams[backupNr][4], backupNr);
		}

		else {
			// send original value to main
			mainWindow.webContents.send("setOriginal:timer", backupsParams[backupNr][4], backupNr);
		}

	}, millisecs);
}

// watch files for change
function fileWatcher(pathFrom, pathTo) {
	let running = true;
	ipcMain.on("stopBackUp:mode", function(e, mode) {
		running = mode;
		console.log(running);
	});

	// watch directory
	fs.watch(pathFrom, function (event, file) {
		if (file) {
			// if running copy files
			if (running) {
				fs.copySync(path.resolve(pathFrom, file), pathTo + "/" + file);
		    	console.log('filename provided: ' + file);
			}

			// if not exit from function
			else {
				return;
			}
		} 

		// @TODO: some error handling here i guess
		else {
		    console.log('filename not provided');
		}
	});
}

/******************************************* 
get directory and display directory stats
*******************************************/
ipcMain.on("directoryFrom:dir", function(e, path){
	fromDirSize = 0;
	fileSizeInBytes = 0;
	fileExtsNames = [];
	fileExtsNamesCount = [];
	getTotalSize(path, "from");
});

ipcMain.on("directoryTo:dir", function(e, path){
	toDirSize = 0;
	fileSizeInBytes = 0;
	fileExtsNames = [];
	fileExtsNamesCount = [];
	getTotalSize(path, "to");
});

// get total folder size
let fromDirSize = 0;
let toDirSize = 0;
let fileSizeInBytes = 0;
let fileExtsNames = [];
let fileExtsNamesCount = [];
function getTotalSize(pathToDir, dir) {
	console.log(pathToDir);
	fs.readdir(pathToDir, function(err, files) {
		if (err) {
			throw err;
		}

		// check every file in directory	 	
	    files.forEach(file => {
	    	file = path.resolve(pathToDir, file), pathToDir + "/" + file;

	    	// get fileSize 
	    	let stats = fs.statSync(file);
	    	if (fileExtsNames.indexOf(path.extname(file).toLowerCase()) === -1) {
	    		fileExtsNames.push(path.extname(file).toLowerCase());
	    	}

	    	// dont include unknown files
	    	fileExtsNamesCount.length = fileExtsNames.length;
	    	if (fileExtsNamesCount[fileExtsNames.indexOf(path.extname(file).toLowerCase())] === undefined && path.extname(file).toLowerCase() != "") {
	    		fileExtsNamesCount[fileExtsNames.indexOf(path.extname(file).toLowerCase())] = 1;
	    	}

	    	else {
	    		fileExtsNamesCount[fileExtsNames.indexOf(path.extname(file).toLowerCase())] = fileExtsNamesCount[fileExtsNames.indexOf(path.extname(file).toLowerCase())] + 1;
	    	}
	    	fileSizeInBytes += stats.size;
	    	console.log(fileSizeInBytes);

	    	if (dir === "from") {
	    		fromDirSize = fileSizeInBytes;
	    	}

	    	else {
	    		toDirSize = fileSizeInBytes;
	    	}

	    	// check if file is dir
	    	let isDir = fs.lstatSync(file).isDirectory();
	    	if (isDir) {
	    		// run function on the file if its a directory
	    		getTotalSize(file, dir);
	    	}
	    });
	    // convert bytes
	bytesToSize(fileSizeInBytes);
	console.log(bytesToSize(fileSizeInBytes));

	if (dir === "from") {
		selectDirWindow.webContents.send("directoryFrom:dir", [bytesToSize(fromDirSize), fileExtsNames, fileExtsNamesCount]);
	}

	else {
		selectDirWindow.webContents.send("directoryTo:dir", [bytesToSize(toDirSize), fileExtsNames, fileExtsNamesCount]);
	}
	});
}

// algo for converting bytes to corresponding byte type
function bytesToSize(bytes) {
   	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   	if (bytes == 0) return '0 Byte';
  	let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

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

// auto launch app on system start
function autoLaunch() {
	const appFolder = path.dirname(process.execPath)
	const updateExe = path.resolve(appFolder, '..', 'Update.exe')
	const exeName = path.basename(process.execPath)
	  
	app.setLoginItemSettings({
	    openAtLogin: true,
	    path: updateExe,
	    args: [
	      '--processStart', `"${exeName}"`,
	      '--process-start-args', `"--hidden"`
	    ]
	})
}

// parse JSON data
function getJSON() {
	try {
		// init backups if not empty
		return require("./json/backups.json");
	}

	// error handling
	catch (e) {
		// if file is not present create it
		if (e.code === "MODULE_NOT_FOUND") {
			fs.open("./json/backups.json", "w", function (err) {
			  	if (err) throw err;
			  	return require("./json/backups.json");
			});
		}
	}
}

// get stored data from JSON file
function getBackUps(jsonBackups) {
	jsonBackups.forEach(backup => {
		// start copyFiles function for each object in file
		if (backup.millisecs != null) {
			backups[backup.backupNr] = copyFiles(backup.pathFrom, backup.pathTo, backup.millisecs * 1000, backup.backupNr, backup.original * 1000, backup.stopped);
		}

		// run watch mode if present
		else {
			backup.millisecs = "watch";
			fileWatcher(backup.pathFrom, backup.pathTo);
			backupsParams.push([backup.pathFrom, backup.pathTo]);
		}

		// increase the count that controlls backup index
		backupCount++;

		// send data to main window and create elements
		mainWindow.webContents.send("directoryFrom:path", backup.pathFrom);
		mainWindow.webContents.send("directoryTo:path", [backup.pathTo, backup.millisecs]);
	});
}

// store backups to JSON file and quit application
function saveData(e) {
	// prevent app from instantly closing
	e.preventDefault();

	// get backups from main window
	mainWindow.webContents.send("getBackups:data", [], backupsParams);
	ipcMain.on("sendBackups:data", function(e, dataArr) {
		let count = 0;
		dataArr.forEach(data => {
			console.log(data);
			backupsParams[count].forEach(param => {
				data.push(param);
			})
			count++;
		});

		// array to contain objects
		const liveBackups = dataArr;
		let jsonData = [];
		liveBackups.forEach(backup => {

			// create json object
			let jsonBackup = {
				pathFrom: backup[1],
				pathTo: backup[2],
				millisecs: backupsParams[backup[0]][2] / 1000,
				backupNr: backup[0],
				original: backupsParams[backup[0]][4] / 1000,
				stopped: backup[6]
			}

			console.log(jsonBackup);
			// push object to array
			jsonData.push(jsonBackup);
		});

		// strinify data object
		let data = JSON.stringify(jsonData);

		// write to file
		console.log(data);
		fs.writeFile("./json/backups.json", data, 'utf8', function (err) {
		    if (err) {
		    	console.log(err);
		        return console.log(err);
		    }

		    // run exit function when done writing
		    appQuit(e);
		});
	});
}

// exit application
function appQuit(e) {
	// set event prevent to false
	e.defaultPrevented = false;

	// necessary to bypass the repeat-quit-check in the render process.
	mainWindow.destroy();

	// quit application
	app.quit();

	// stop app process
   	mainWindow = null;
}
