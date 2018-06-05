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
		const timer = document.createElement("p");
		const countdown = document.createElement("span");
		const icon = document.createElement("i");
		icon.className = "material-icons renewRunning";
		icon.innerHTML = "autorenew";
		countdown.className = "countdown";
		timer.appendChild(icon);
		timer.appendChild(countdown);

		// append to backup container
		backUpDiv.appendChild(fromDir);
		backUpDiv.appendChild(timer);

		// display in main window
		document.querySelector("#backedUpCont").appendChild(backUpDiv);
	});

	// get to directory data
	ipcRenderer.on("directoryTo:path", function(e, path){

		// to dir
		const toDir = document.createElement("h5");
		toDir.innerHTML = path[0];

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

		console.log(backUpDiv.childNodes);
		backUpDiv.childNodes[1].childNodes[1].innerHTML = convertMillisecs(parseInt(path[1]) * 1000);
		countdown(parseInt(path[1]) * 1000);
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
	this.removeEventListener("click", stopBackUp);
	this.classList.add("disabledBtn");
	this.parentElement.childNodes[1].childNodes[0].classList.remove("renewRunning");
	this.parentElement.childNodes[3].innerHTML = "<i class='material-icons stopped'>brightness_1</i><span>Stopped</span></p>";

	const startBtn = this.parentElement.childNodes[4];
	startBtn.classList.remove("disabledBtn");
	startBtn.addEventListener("click", startBackUp);
}

// start selected backup
function startBackUp() {
	this.removeEventListener("click", startBackUp);
	this.classList.add("disabledBtn");
	this.parentElement.childNodes[1].childNodes[0].classList.add("renewRunning");
	this.parentElement.childNodes[3].innerHTML = "<i class='material-icons running'>brightness_1</i><span>Running</span></p>";


	const stopBtn = this.parentElement.childNodes[5];
	stopBtn.classList.remove("disabledBtn");
	stopBtn.addEventListener("click", stopBackUp);
}

function convertMillisecs(millisecs) {
	let days, hours, mins, secs;
	secs = Math.floor(millisecs / 1000);
	mins = Math.floor(secs / 60);
	secs = secs % 60;
	hours = Math.floor(mins / 60);
	mins = mins % 60;
	days = Math.floor(hours / 24);
	hours = hours % 24;
	return days + "<span>d </span>" + hours + "<span>h </span>" + mins + "<span>m </span>" + secs + "<span>s </span>";
};

// Update the count down every 1 second
function countdown(millisecs) {
	setInterval(function() {

		var time = new Date().getTime() + millisecs;
		var date = new Date(time);
		console.log(date.toString()); // Wed Jan 12 2011 12:42:46 GMT-0800 (PST)

	  	/*// Time calculations for days, hours, minutes and seconds
	  	var days = Math.floor(millisecs / (1000 * 60 * 60 * 24));
	  	var hours = Math.floor((millisecs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	  	var minutes = Math.floor((millisecs % (1000 * 60 * 60)) / (1000 * 60));
	  	var seconds = Math.floor((millisecs % (1000 * 60)) / 1000);

	  	// Display the result in the element with id="demo"
	  	document.getElementById("demo").innerHTML = days + "d " + hours + "h "
	  	+ minutes + "m " + seconds + "s ";*/
	}, 1000);
}