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

	// regex for valid path validation
	const validPath = /^[a-zA-Z]:\\(\w+\\)*\w*$/;

	if (pathFrom.length < 1) {
		M.toast({html: 'Please select a <span class="toastSpan">FROM</span> directory'});
		return;
	}

	if (isFile(pathFrom) || !validPath.test(pathFrom)) {
		M.toast({html: 'Directory path <span class="toastSpan">FROM</span> is not valid'});
		return;
	}

	if (pathTo.length < 1) {
		M.toast({html: 'Please select a <span class="toastSpan">TO</span> directory'});
		return;
	}

	if (isFile(pathTo) || !validPath.test(pathTo)) {
		M.toast({html: 'Directory path <span class="toastSpan">TO</span> is not valid'});
		return;
	}

	if (!isFile(pathFrom) && !isFile(pathTo) && validPath.test(pathFrom) && validPath.test(pathTo)) {
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
