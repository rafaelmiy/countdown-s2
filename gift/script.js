
var string = ["Oi vida, ultimamente você anda muito cansada e estressada...", "e por esse motivo, no dia de hoje...", "resolvi fazer algo para mudar isso, te presenteando com um..."];
var array1 = string[0].split("");
var array2 = string[1].split("");
var array3 = string[2].split("");
var timer;



function frameLooper1 () {
	if (array1.length > 0) {
		document.getElementById("text1").innerHTML += array1.shift();
		// console.log(array1);
		loopTimer = setTimeout('frameLooper1()',110); /* change 70 for speed */
	}
	else {
		clearTimeout(timer);
		setTimeout('frameLooper2()',1500);
	}
}
function frameLooper2 () {
	if (array2.length > 0) {
		document.getElementById("text2").innerHTML += array2.shift();
		loopTimer = setTimeout('frameLooper2()',100); /* change 70 for speed */
	}
	else {
		clearTimeout(timer);
		setTimeout('frameLooper3()',800);
	}
}
function frameLooper3 () {
	if (array3.length > 0) {
		document.getElementById("text3").innerHTML += array3.shift();
		loopTimer = setTimeout('frameLooper3()',100); /* change 70 for speed */
	}
	else {
		clearTimeout(timer);
		setTimeout('showGift()',1000);
	}
}

function showGift(){
	$("#gift").removeClass("hide");
	setTimeout('showLogo()',4000);
}
function showLogo(){
	$("#logo").removeClass("hide");
	setTimeout('showVideo()',2000);
}
function showVideo(){
	$("#video").removeClass("hide");
}

function runHistory(){
	$("#button-start").addClass("hide");
	setTimeout('frameLooper1()',500);
}

$( document ).ready(function(){
	$("#button-start").removeClass("hide");
})
