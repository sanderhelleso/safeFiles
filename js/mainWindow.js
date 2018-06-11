window.onload = start;

let backUpCounter = 0;
const electron = require("electron");
const titleBar = require("electron-titlebar");
const {ipcRenderer} = electron;
function start() {

	// get from directory data
	ipcRenderer.on("directoryFrom:path", function(e, path){

		// create the backup container
		const backUpDiv = document.createElement("div");
		backUpDiv.className = "backedUpDir animated fadeIn";
		backUpDiv.id = "backup-" + backUpCounter;
		backUpCounter++;

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

		//  hidden ele to keep trac of its timer
		let hiddenTimer = document.createElement("span");
		hiddenTimer.style.display = "none";

		// set random id to coutdown element
		hiddenTimer.id = idGenerator();

		if (path[1] != "watch") {
			hiddenTimer.innerHTML = parseInt(path[1]) * 1000;
			backUpDiv.childNodes[1].childNodes[1].innerHTML = convertMillisecs(hiddenTimer.innerHTML);
			// push hidden timer ele with its innerHTML as countdown value
			backUpDiv.appendChild(hiddenTimer);
			countdownValues.push(hiddenTimer);
			// always run last timer added to array
			let startCountdown = countdown(countdownValues[countdownValues.length - 1].innerHTML, backUpDiv.childNodes[1].childNodes[1], hiddenTimer.id, parseInt(path[1]) * 1000);
			runningCountdowns.push(startCountdown);
			originalValues.push(parseInt(path[1]) * 1000);
		}

		else {
			hiddenTimer.innerHTML = "On file change";
			backUpDiv.childNodes[1].childNodes[1].innerHTML = "On file change";
			// push hidden timer ele with its innerHTML as countdown value
			backUpDiv.appendChild(hiddenTimer);
			countdownValues.push(hiddenTimer);
			let startCountdown = "On file change";
			runningCountdowns.push(startCountdown);
		}

		// check if backups are present
		noBackUps(runningCountdowns);
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

	// pause countdown
	ipcRenderer.send("stopBackUp:mode", false);
	ipcRenderer.send("stopBackUp:nr", this.parentElement.id.split("-")[1]);
	clearInterval(runningCountdowns[parseInt(this.parentElement.id.split("-")[1])]);
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

	// stop function if countdown is not set
	if (this.parentElement.childNodes[6].innerHTML === "On file change") {
		ipcRenderer.send("stopBackUp:mode", true);
		return;
	}

	// resume countdown
	let millisecs = parseInt(this.parentElement.childNodes[6].innerHTML);
	let ele = this.parentElement.childNodes[1].childNodes[1];
	let id = this.parentElement.childNodes[6].id;
	ipcRenderer.send("startBackUp:nr", [this.parentElement.childNodes[0].innerHTML, this.parentElement.childNodes[2].innerHTML, this.parentElement.id.split("-")[1], millisecs, originalValues[parseInt(this.parentElement.id.split("-")[1])]]);
	runningCountdowns[parseInt(this.parentElement.id.split("-")[1])] = countdown(millisecs, ele, id, originalValues[parseInt(this.parentElement.id.split("-")[1])]);
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
let originalValues = [];
let countdownValues = [];
let runningCountdowns = [];
function countdown(millisecs, ele, id, original) {
	return setInterval(function() {

		// find selected countdown
		let currentCountdown = parseInt(countdownValues.indexOf(document.getElementById(id)));
		millisecs = parseInt(countdownValues[currentCountdown].innerHTML) - 1000;

	  	// Time calculations for days, hours, minutes and seconds
	  	var days = Math.floor(millisecs / (1000 * 60 * 60 * 24));
	  	var hours = Math.floor((millisecs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	  	var mins = Math.floor((millisecs % (1000 * 60 * 60)) / (1000 * 60));
	  	var secs = Math.floor((millisecs % (1000 * 60)) / 1000);

	  	// Display the result in the element with id="demo"
	  	ele.innerHTML = days + "<span>d </span>" + hours + "<span>h </span>" + mins + "<span>m </span>" + secs + "<span>s </span>";

	  	// reset to orginal value when timer is done
	  	if (parseInt(countdownValues[currentCountdown].innerHTML) === 1000) {
	  		countdownValues[currentCountdown].innerHTML = original + 1000;
	  	}

	  	// reduce by 1000 every interval
	  	countdownValues[currentCountdown].innerHTML = parseInt(countdownValues[currentCountdown].innerHTML) - 1000;
	}, 1000);
}

// send all backups on app quit
ipcRenderer.on("getBackups:data", function(e, dataArr, backupArr) {
	for (let i = 0; i < backupArr.length; i++) {
		console.log(backupArr[i]);
		originalValues[i] = backupArr[i][4];
	}
	const backUpEles = document.querySelectorAll(".backedUpDir");
	let count = 0;
	backUpEles.forEach(ele => {
		originalValues[count]
		// update values for backend
		ele.childNodes[5].click();
		ele.childNodes[4].click();

		// send data to app.js
		console.log([count]);
		dataArr.push([count]);
		count++;
	});

	ipcRenderer.send("sendBackups:data", dataArr);
});

// send all backups on app quit
ipcRenderer.on("setOriginal:timer", function(e, millisecs, id) {
	console.log(id);
	console.log(millisecs);

	// get specific ele
	const ele = document.querySelectorAll(".backedUpDir")[id];
	ele.childNodes[6].innerHTML = millisecs;
	originalValues[id] = millisecs;
});

function idGenerator() {
    let id = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (id() + id() + "-" + id() + "-" + id() + "-" + id() + "-" + id() + id() + id());
}

function noBackUps(arr) {
	if (arr.length >= 1) {
		document.querySelector("#noBackUps").style.display = "none";
	}

	else {
		document.querySelector("#noBackUps").style.display = "block";
	}
}