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

	// init file handler
	handleFileStats();

	// init timepicker
	timepicker();
	triggerTimepicker();
}

function triggerTimepicker() {
	const options = document.querySelectorAll(".validTimeOption");
	console.log(options);
	options.forEach(ele => {
		// open timepicker on click
		ele.addEventListener("click", () => document.querySelector(".timepicker").click());
	});
}

// regex for valid path validation
const validPath = /^[a-zA-Z]:\\(\w+\\)*\w*$/;
function setDirectory(e) {
	// prevet form for submiting
	e.preventDefault();
	const pathFrom = document.querySelector("#directoryFrom").value;
	const pathTo = document.querySelector("#directoryTo").value;
	const millisecs = document.querySelector('input[name="group1"]:checked').value;

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
		ipcRenderer.send("directoryTo:path", [pathTo, parseInt(millisecs) + reCalculateTime()]); // @TODO: FIX WATCH MODE BUG
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
		document.querySelector(".dirSizeFrom").innerHTML = stats[0];
		stats[1][stats[1].indexOf("")] = "unknown";
		myChart.data.labels = stats[1];
		for (let i = 0; i < stats[2].length; i++) {
			myChart.data.datasets[0].data[i] = stats[2][i];
		}
		myChart.update();
	});

	ipcRenderer.on("directoryTo:dir", function(e, stats){
		document.querySelector(".dirSizeTo").innerHTML = stats[0];
		stats[1][stats[1].indexOf("")] = "unknown";
		myChart2.data.labels = stats[1];
		for (let i = 0; i < stats[2].length; i++) {
			myChart2.data.datasets[0].data[i] = stats[2][i];
		}
		myChart2.update();
	});
}

function timepicker() {
	// create the timepicker
   	const timer = document.querySelectorAll('.timepicker');
   	timer[0].addEventListener("change", reCalculateTime);
   	console.log(timer[0]);
    const instance = M.Timepicker.init(timer, {
    	twelveHour: false
    });

    // create heading
    const timerHead = document.querySelector(".timepicker-digital-display");
    const headerMsg = document.createElement("h5");
    headerMsg.className = "center-align white-text timepickerHeading";
    headerMsg.innerHTML = "When do you want<br>the backup to run?";
    timerHead.appendChild(headerMsg);
}

function reCalculateTime() {
	// get selected time values from timepicker
	const timeValues = document.querySelectorAll('.timepicker')[0];

	// get today
	const today = new Date();

	// get seconds from today
	const todaySecs = today.getSeconds();

	// get hour from timepicker
	const hours = timeValues.value.split(":")[0];

	// get mins from timepicker
	const mins = timeValues.value.split(":")[1];

	// get date with new selected values
	const selectedTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, mins, todaySecs);

	// get time in millisecs and to convert to app usable time
	const time = (selectedTime.getTime() - today.getTime()) / 1000;

	console.log(time);
	return time;
}