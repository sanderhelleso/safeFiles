window.onload = start;

function start() {
	const electron = require("electron");
	const {ipcRenderer} = electron;
	const h2 = document.querySelector("#test");
	const h22 = document.querySelector("#test2");

	ipcRenderer.on("directoryFrom:path", function(e, path){
		h2.innerHTML = path;
	});

	ipcRenderer.on("directoryTo:path", function(e, path){
		h22.innerHTML = path;
	});
}