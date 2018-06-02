window.onload = start;

function start() {
	const electron = require("electron");
	const {ipcRenderer} = electron;

	ipcRenderer.on("directoryFrom:path", function(e, path){
		
	});

	ipcRenderer.on("directoryTo:path", function(e, path){
		
	});
}