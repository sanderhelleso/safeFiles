window.onload = start;

const electron = require("electron");
const titleBar = require("electron-titlebar");
const {ipcRenderer} = electron;
function start() {
	const form = document.querySelector("form");
	form.addEventListener("submit", setDirectory);

	// invert color of static titlebar imgs (black to white)
	document.querySelector(".button-img-minimize").style.filter = "invert(100%)";
	document.querySelector(".button-img-close").style.filter = "invert(100%)";
}

function setDirectory(e) {
	e.preventDefault();
	const pathFrom = document.querySelector("#directoryFrom").value;
	const pathTo = document.querySelector("#directoryTo").value;

	console.log(isFile(pathFrom));
	console.log(isFile(pathTo));

	if (pathFrom.length < 1) {
		M.toast({html: 'Please select a FROM directory'});
		return;
	}

	if (pathTo.length < 1) {
		M.toast({html: 'Please select a TO directory'});
		return;
	}

	if (isFile(pathFrom)) {
		M.toast({html: 'Directory path FROM is not valid'});
		return;
	}

	if (isFile(pathTo)) {
		M.toast({html: 'Directory path TO is not valid'});
		return;
	}

	if (!isFile(pathFrom) && !isFile(pathTo)) {
		ipcRenderer.send("directoryFrom:path", pathFrom);
		ipcRenderer.send("directoryTo:path", pathTo);
	}
}

function isFile(path) {
    return path.split('/').pop().indexOf('.') > -1;
}

function isDir(path) {
	return !isFile(path);
}
