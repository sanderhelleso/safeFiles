window.onload = start;

const electron = require("electron");
const titleBar = require("electron-titlebar");
const {ipcRenderer} = electron;
function start() {
	const form = document.querySelector("form");
	form.addEventListener("submit", setDirectory);
	document.querySelector("#directoryFrom").addEventListener("input", getDirStats);
	document.querySelector("#directoryTo").addEventListener("input", getDirStats);

	// invert color of static titlebar imgs (black to white)
	document.querySelector(".button-img-minimize").style.filter = "invert(100%)";
	document.querySelector(".button-img-close").style.filter = "invert(100%)";

	handleFileStats();
}

// regex for valid path validation
const validPath = /^[a-zA-Z]:\\(\w+\\)*\w*$/;
function setDirectory(e) {
	// prevet form for submiting
	e.preventDefault();
	const pathFrom = document.querySelector("#directoryFrom").value;
	const pathTo = document.querySelector("#directoryTo").value;

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

let count = 0;
function getDirStats() {

	// check for valid dir path
	if (validPath.test(this.value) && !isFile(this.value)) {
		// check if dir is FROM / TO
		if (this.id === "directoryFrom") {
			ipcRenderer.send("directoryFrom:dir", this.value);
			document.querySelector("#fromDirName").innerHTML = this.value;
			document.querySelector("#fromDirStats").style.display = "block";
		}

		else {
			console.log(this.value);
			ipcRenderer.send("directoryTo:dir", this.value);
			document.querySelector("#toDirName").innerHTML = this.value;
			document.querySelector("#toDirStats").style.display = "block";
		}
		return;
	}
}

function handleFileStats() {
	ipcRenderer.on("directoryFrom:dir", function(e, stats){
		console.log(stats);
		//document.querySelector(".dirSizeFrom").innerHTML = stats;
	});

	ipcRenderer.on("directoryTo:dir", function(e, stats){
		document.querySelector(".dirSizeTo").innerHTML = stats;
	});
}
