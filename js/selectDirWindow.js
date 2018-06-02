window.onload = start;

const electron = require("electron");
const {ipcRenderer} = electron;
function start() {
	const form = document.querySelector("form");
	form.addEventListener("submit", setDirectory);
}

function setDirectory(e) {
	e.preventDefault();
	const pathFrom = document.querySelector("#directoryFrom").value;
	const pathTo = document.querySelector("#directoryTo").value;
	ipcRenderer.send("directoryFrom:path", pathFrom);
	ipcRenderer.send("directoryTo:path", pathTo);
}