window.onload = start;

function start() {
	const electron = require("electron");
	const titleBar = require("electron-titlebar");
	const {ipcRenderer} = electron;

	ipcRenderer.on("directoryFrom:path", function(e, path){
		
	});

	ipcRenderer.on("directoryTo:path", function(e, path){
		
	});

	const fullScreen = document.querySelector("#fullScreen");
	fullScreen.addEventListener("click", fullScreenMode);

	document.querySelector(".button-img-minimize").style.filter = "invert(100%)";
	document.querySelector(".button-img-close").style.filter = "invert(100%)";
}

let isFullScreen = false;
function fullScreenMode() {
	const sideCont =  document.querySelector("#sideCont");
	const mainCont =  document.querySelector("#mainCont");

	if (isFullScreen === false) {
		sideCont.className = "col s12 animated fadeInLeft";
		mainCont.style.display = "none";
		isFullScreen = true;
		return;
	}

	else {
		sideCont.className = "col s3 animated fadeInRight";
		mainCont.style.display = "block";
		isFullScreen = false;
		return;
	}
}