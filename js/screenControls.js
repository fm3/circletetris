"use strict";

var screenControls = (function() {
	var self = null;

	return {
		initialize: function() {
			self = this;
			var keyMappings = {
				"newGameButton": "n",
				"pauseButton": "p",
				"aboutButton": "a",
				"highScoresButton": "h",
				"upButton": "ArrowUp",
				"leftButton": "ArrowLeft",
				"rightButton": "ArrowRight",
				"downButton": "ArrowDown"
			};

			for (var buttonId in keyMappings) {
				if (keyMappings.hasOwnProperty(buttonId)) {
					self.attachKeyToButton(buttonId, keyMappings[buttonId]);
				}
			}

			window.addEventListener("mouseup", keyboardControls.clearAll);
			$("pause").onclick = function() {self.emitKeyDown("p");};
			$("gameOver").onclick = function() {self.emitKeyDown("n");};
		},

		attachKeyToButton: function(buttonId, key) {
			if (key.indexOf("Arrow") !== -1) {
				$(buttonId).onmousedown = function() {self.emitKeyDown(key);};
				$(buttonId).ontouchstart = function(e) {self.emitKeyDown(key); e.stopPropagation(); e.preventDefault();};
				$(buttonId).ontouchend = function(e) {keyboardControls.clearAll(); e.stopPropagation(); e.preventDefault();};
				$(buttonId).ontouchcancel = function(e) {keyboardControls.clearAll(); e.stopPropagation(); e.preventDefault();};
			} else {
				$(buttonId).onclick = function() {self.emitKeyDown(key);};
			}
		},

		emitKeyDown: function(key) {
			keyboardControls.onKeyDown({"key": key});
		},
	};

}());
