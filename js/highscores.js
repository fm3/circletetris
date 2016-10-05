"use strict";

var highscores = (function() {
	var self;

	return {
		lowestOldHighscore: null,

		initialize: function() {
			self = this;
			self.loadLowestOldHighscore();
		},

		loadLowestOldHighscore: function() {
			self.fetchHighscoreData(self.saveLowestOldHighscore, function(){});
		},

		saveLowestOldHighscore: function(csv) {
			var values = csv.split(";");
			self.lowestOldHighscore = parseInt(values[values.length-1]);
		},

		submitIfGoodEnough: function(score) {
			if (self.lowestOldHighscore === null || score <= self.lowestOldHighscore) {
				return;
			}
			popups.show("submit-highscore");
			$("submit-input").focus();
			$("submit-button").onclick = self.submit;
		},

		submit: function() {
			var name = $("submit-input").value;
			if (!self.isValidName(name)) {
				alert("Please enter a name (without characters & ; < > ?)");
				return;
			}
			var score = gamePlay.currentScore;
			var checksum = name.length + score % 100;
			$("submitting").style.display = "block";
			var request = new XMLHttpRequest();
			try {
				request.open("GET", "highscores/submit.php?s="+score+"&n="+name+"&c="+checksum);
			} catch(err) {
				alert("Could not submit high score. Are you connected to the Internet?");
				console.log(err);
				return;
			}
			request.timeout = 2000;
			request.onreadystatechange = function() {
				$("submitting").style.display = "none";
				if (request.readyState == 4) {
					if (request.status == 200) {
					popups.hide();
					self.loadhighScores();
					popups.show("highscores");
					} else {
						alert("Could not submit high score. Are you connected to the Internet?");
					}
				}
			};
			request.send();
		},

		isValidName: function(name) {
			return (name.length > 0 &&
				name.indexOf("&") == -1 &&
				name.indexOf("?") == -1 &&
				name.indexOf("<") == -1 &&
				name.indexOf(">") == -1 &&
				name.indexOf(";")==-1);
		},

		loadHighscores: function() {
			self.fetchHighscoreData(self.showHighscores, self.showLoadingError);
		},

		fetchHighscoreData: function(onsuccess, onerror) {
			var request = new XMLHttpRequest();
			try {
				request.open("GET", "highscores/highscores.csv");
			} catch(err) {
				onerror();
				return;
			}
			request.timeout = 2000;
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) {
						onsuccess(request.responseText);
					} else {
						onerror();
					}
				}
			};
			request.setRequestHeader("Cache-Control", "no-cache");
			request.setRequestHeader("Pragma", "no-cache");
			request.send();
		},

		showHighscores: function(csv) {
			var values = csv.split(";");
			if (values.length < 2) {
				self.showLoadingError();
				return;
			}
			$("highscores-loading").style.display = "none";
			var table = $("highscores-table");
			table.style.display = "block";

			while (table.firstChild) {
				table.removeChild(table.firstChild);
			}
			self.clearErrorMessage();

			for (var i = 0; i < values.length/2; i++) {
				var tr = document.createElement("tr");
				var tdRank = document.createElement("td");
				var textRank = document.createTextNode(i + 1);
				tdRank.appendChild(textRank);
				tr.appendChild(tdRank);

				var tdName = document.createElement("td");
				var textName = document.createTextNode(values[2*i]);
				tdName.appendChild(textName);
				tr.appendChild(tdName);

				var tdScore = document.createElement("td");
				var textScore = document.createTextNode(values[2*i+1]);
				tdScore.appendChild(textScore);
				tr.appendChild(tdScore);

				table.appendChild(tr);
			}
		},

		showLoadingError: function() {
			$("highscores-loading").style.display = "none";
			self.clearErrorMessage();
			var errorP = document.createElement("p");
			var errorText = document.createTextNode("Could not fetch latest high scores. Are you connected to the internet?");
			errorP.appendChild(errorText);
			errorP.setAttribute("id", "highscores-error");
			var table = $("highscores-table");
			table.parentElement.insertBefore(errorP, table);
		},

		clearErrorMessage: function() {
			var errorP = $("highscores-error");
			if (errorP) {
				errorP.parentElement.removeChild(errorP);
			}
		}
	};

}());
