window.onload = start;

function start() {
	const electron = require("electron");
	const {ipcRenderer} = electron;

	ipcRenderer.on("directoryFrom:path", function(e, path){
		
	});

	ipcRenderer.on("directoryTo:path", function(e, path){
		
	});

	const fullScreen = document.querySelector("#fullScreen");
	fullScreen.addEventListener("click", fullScreenMode);
}

let isFullScreen = false;
function fullScreenMode() {
	const sideCont =  document.querySelector("#sideCont");
	const mainCont =  document.querySelector("#mainCont");

	if (isFullScreen === false) {
		sideCont.className = "col s12";
		mainCont.style.display = "none";
		isFullScreen = true;
		return;
	}

	else {
		sideCont.className = "col s3";
		mainCont.style.display = "block";
		isFullScreen = false;
		return;
	}
}