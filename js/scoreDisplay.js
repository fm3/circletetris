"use strict";

var scoreDisplay = (function() {
	var self = null;

	return {
		scoreTextNode: null,
		scoreLabelTextNode: null,

		initialize: function() {
			self = this;
			self.scoreTextNode = document.createTextNode("0");
			self.scoreLabelTextNode = document.createTextNode("Points");
			$("score").appendChild(self.scoreTextNode);
			$("scoreLabel").appendChild(self.scoreLabelTextNode);
		},

		update: function(score) {
			self.scoreTextNode.nodeValue = score;
			if (score == 1) {
				self.scoreLabelTextNode.nodeValue = "Point";
			} else {
				self.scoreLabelTextNode.nodeValue = "Points";
			}
		}
	};

}());
