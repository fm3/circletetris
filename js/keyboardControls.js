"use strict";

var keyboardControls = (function() {
	var self = null;

	return {
		isLeftArrowDown: false,
		isRightArrowDown: false,
		isDownArrowDown: false,
		timerRight: null,
		timerLeft: null,
		timerDown: null,

		initialize: function() {
			self = this;
			document.onkeydown = self.onKeyDown;
			document.onkeyup = self.onKeyUp;
		},

		onKeyDown: function(keyEvent) {
			if (popups.isShown()) {
				switch(keyEvent.key) {
					case "Escape":
					popups.hide();
					break;

					case "a":
					popups.hideIfPresent("about");
					break;

					case "h":
					popups.hideIfPresent("highscores");
					break;
				}
				return;
			}

			switch(keyEvent.key) {
				case "n":
				gamePlay.startNew();
				break;

				case "p":
				gamePlay.togglePause();
				break;

				case "a":
				popups.show("about");
				break;

				case "h":
				highscores.loadHighscores();
				popups.show("highscores");
				break;

				case "ArrowUp":
				case "Up":
				gamePlay.rotateStone();
				break;

				case "ArrowLeft":
				case "Left":
				self.onLeftArrowDown();
				break;

				case "ArrowRight":
				case "Right":
				self.onRightArrowDown();
				break;

				case "ArrowDown":
				case "Down":
				self.onDownArrowDown();
				break;
			}
		},


		onLeftArrowDown: function() {
			if (self.isLeftArrowDown) {
				return;
			}
			self.isLeftArrowDown = true;
			gamePlay.moveStoneLeft();
			clearTimeout(self.timerLeft);
			self.timerLeft = setTimeout(self.continuousLeft, 300);
		},

		onRightArrowDown: function() {
			if (self.isRightArrowDown) {
				return;
			}
			self.isRightArrowDown = true;
			gamePlay.moveStoneRight();
			clearTimeout(self.timerRight);
			self.timerRight = setTimeout(self.continuousRight, 300);
		},

		onDownArrowDown: function() {
			if (self.isDownArrowDown) {
				return;
			}
			self.isDownArrowDown = true;
			gamePlay.moveStoneDown();
			clearTimeout(self.timerDown);
			self.timerDown = setTimeout(self.continuousDown, 300);
		},

		continuousLeft: function() {
			if(self.isLeftArrowDown) {
				gamePlay.moveStoneLeft();
				self.timerLeft = setTimeout(self.continuousLeft, 100);
			}
		},

		continuousRight: function() {
			if(self.isRightArrowDown) {
				gamePlay.moveStoneRight();
				self.timerRight = setTimeout(self.continuousRight, 100);
			}
		},

		continuousDown: function() {
			if(self.isDownArrowDown) {
				gamePlay.moveStoneDown();
				self.timerDown = setTimeout(self.continuousDown, 100);
			}
		},

		onKeyUp: function(keyEvent) {
			switch (keyEvent.key) {
				case "ArrowLeft":
				case "Left":
				clearTimeout(self.timerLeft);
				self.isLeftArrowDown = false;
				break;

				case "ArrowRight":
				case "Right":
				clearTimeout(self.timerRight);
				self.isRightArrowDown = false;
				break;

				case "ArrowDown":
				case "Down":
				clearTimeout(self.timerDown);
				self.isDownArrowDown = false;
				break;
			}
		},

		clearAll: function() {
			self.isLeftArrowDown = false;
			self.isRightArrowDown = false;
			self.isDownArrowDown = false;
			clearTimeout(self.timerLeft);
			clearTimeout(self.timerRight);
			clearTimeout(self.timerDown);
		}
	};

}());

