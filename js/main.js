"use strict";

window.onload = initialize;

function initialize() {
	scoreDisplay.initialize();
	fieldView.initialize();
	gamePlay.initialize();
	keyboardControls.initialize();
	screenControls.initialize();
	popups.initialize();
	highscores.initialize();
}

function $(id) {
	return document.getElementById(id);
}
