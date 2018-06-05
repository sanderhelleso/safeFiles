window.onload = start;

function start() {
	const electron = require("electron");
	const titleBar = require("electron-titlebar");
	const {ipcRenderer} = electron;

	// get from directory data
	ipcRenderer.on("directoryFrom:path", function(e, path){

		// create the backup container
		const backUpDiv = document.createElement("div");
		backUpDiv.className = "backedUpDir animated fadeIn";

		// from dir
		const fromDir = document.createElement("h5");
		fromDir.innerHTML = path;

		// icon
		const icon = document.createElement("i");
		icon.className = "material-icons renewRunning";
		icon.innerHTML = "autorenew";

		// append to backup container
		backUpDiv.appendChild(fromDir);
		backUpDiv.appendChild(icon);

		// display in main window
		document.querySelector("#backedUpCont").appendChild(backUpDiv);
	});

	// get to directory data
	ipcRenderer.on("directoryTo:path", function(e, path){

		// to dir
		const toDir = document.createElement("h5");
		toDir.innerHTML = path;

		// status | RUNNING / STOPPED
		const status = document.createElement("p");
		status.className = "status";
		status.innerHTML = "<i class='material-icons running'>brightness_1</i><span>Running</span>";

		// start button
		const startBtn = document.createElement("a");
		startBtn.className = "waves-effect waves-light btn btn-small startBackUpBtn disabledBtn z-depth-2 hoverable";
		startBtn.innerHTML = "<i class='material-icons left'>backup</i>start";

		// stop button
		const stopBtn = document.createElement("a");
		stopBtn.className = "waves-effect waves-light btn btn-small stopBackUpBtn z-depth-2 hoverable";
		stopBtn.innerHTML = "<i class='material-icons left'>pause</i>stop";
		stopBtn.addEventListener("click", stopBackUp);

		// get the backup container created in directoryFrom:path
		const backUpDiv = document.querySelector("#backedUpCont").childNodes[document.querySelector("#backedUpCont").childNodes.length - 1];

		// display in main window
		backUpDiv.appendChild(toDir);
		backUpDiv.appendChild(status);
		backUpDiv.appendChild(startBtn);
		backUpDiv.appendChild(stopBtn);
	});

	// fullscreen menu toggle
	const fullScreen = document.querySelector("#fullScreen");
	fullScreen.addEventListener("click", fullScreenMode);

	// invert color of static titlebar imgs (black to white)
	document.querySelector(".button-img-minimize").style.filter = "invert(100%)";
	document.querySelector(".button-img-close").style.filter = "invert(100%)";
}

// fullscreen status
let isFullScreen = false;
function fullScreenMode() {
	const sideCont =  document.querySelector("#sideCont");
	const mainCont =  document.querySelector("#mainCont");

	/*** check if screen is in what mode, run code accordingly ***/
	
	// open
	if (isFullScreen === false) {
		sideCont.className = "col s12 animated fadeInLeft";
		mainCont.style.display = "none";
		isFullScreen = true;
		return;
	}

	// close
	else {
		sideCont.className = "col s3 animated fadeInRight";
		mainCont.style.display = "block";
		isFullScreen = false;
		return;
	}
}

// stop selected backup
function stopBackUp() {
	console.log(123);
}

// start selected backup
function startBackUp() {
	console.log(321);
}