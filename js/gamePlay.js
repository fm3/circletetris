"use strict";

var gamePlay = (function() {
	var self = null;

	return {
		isStarted: false,
		isPaused: false,
		isOver: false,

		rotationState: null,
		cellsFixed: [],
		cellsMoving: [],
		nextStoneType: null,
		currentStoneType: null,
		currentStoneCenter: null,

		currentScore: null,

		gravityTimer: null,
		gravityStepTime: null,

		initialize: function() {
			self = this;

			self.allStonePieces = {
				// square  rightS  rightZ  slat  trapezium  rightL  mirrorL
				// ##      #        #      ####   #           #      #
				// ##      ##      ##            ###        ###      #
				//          #      #                                ##
				// Each "pixel" is [row, col], with [0,0] being top-left
				"square":    [[1,0], [1,1], [2,0], [2,1]],
				"rightS":    [[1,0], [2,0], [2,1], [3,1]],
				"rightZ":    [[1,1], [2,1], [2,0], [3,0]],
				"slat":      [[1,0], [1,1], [1,2], [1,3]],
				"trapezium": [[1,1], [2,0], [2,1], [2,2]],
				"rightL":    [[1,2], [2,0], [2,1], [2,2]],
				"mirrorL":   [[1,1], [2,1], [3,1], [3,0]]
			};

			window.onblur = self.pause;
		},

		startNew: function() {
			self.isStarted = true;
			self.isPaused = false;
			self.isOver = false;
			self.currentScore = 0;

			self.gravityStepTime = 2000;
			self.rotationState = 0;
			self.clearField();

			self.prepareNewStone();
			self.insertPreparedStone();
		},

		togglePause: function() {
			if (!(self.isStarted) || self.isOver) {
				return;
			}
			if (self.isPaused) {
				self.isPaused = false;
				self.activateGravityTimer();
			} else {
				self.isPaused = true;
				clearTimeout(self.gravityTimer);
				keyboardControls.clearAll();
			}
			fieldView.updatePaused(self.isPaused);
		},

		pause: function() {
			if (!self.isPaused) {
				self.togglePause();
			}
		},

		rotateStone: function() {
			if (!self.isStarted || self.isPaused || self.isOver) {
				return;
			}

			if (self.currentStoneType == "square") {
				return;
			}

			var temp = [];
			for (var i = 0; i < config.rowCount; i++) {
				temp.push(new Array(4)); //curent stone is always within the 4 center-most columns
				for (var j = 0; j < 4; j++) {
					temp[i][j] = "none";
				}
			}

			// rotating by 90 degrees around center
			for (var i = 0; i < config.rowCount; i++) {
				for (var j = 0; j < 4; j++) {
					if (self.cellsMoving[i][j] != "none") {
						var newI = self.currentStoneCenter.row + (j - self.currentStoneCenter.col);
						var newJ = self.currentStoneCenter.col - (i - self.currentStoneCenter.row);
						if (self.currentStoneType == "slat") {
							newI = self.currentStoneCenter.row-1 - (j - (self.currentStoneCenter.col+1));
							newJ = self.currentStoneCenter.col+1 - (i - (self.currentStoneCenter.row-1));
						}
						temp[newI][newJ] = self.cellsMoving[i][j];
					}
				}
			}

			//abort if rotation would collide with fixed stones
			for (var i = 0; i < config.rowCount; i++) {
				for (var j = 0; j < 4; j++) {
					if (temp[i][j] != "none" && self.cellsFixed[i][j] != "none") {
						return;
					}
				}
			}

			//transfer help to cellsMoving
			for (var i = 0; i < config.rowCount; i++) {
				for (var j = 0; j < 4; j++) {
					self.cellsMoving[i][j] = temp[i][j];
				}
			}
			fieldView.updateCellColors(self.cellsFixed, self.cellsMoving);
		},

		moveStoneLeft: function() {
			if (self.isFreeToMove(-1)) {
				for (var row = 0; row < config.rowCount; row++) {
					var temp = self.cellsFixed[row].pop();
					self.cellsFixed[row].unshift(temp);
				}
				self.rotationState = (self.rotationState - 360 / config.colCount) % 360;
				fieldView.updateCellColors(self.cellsFixed, self.cellsMoving);
				fieldView.updateRotationIndicator(self.rotationState);
			}
		},

		moveStoneRight: function() {
			if (self.isFreeToMove(1)) {
				for (var row = 0; row < config.rowCount; row++) {
					var temp = self.cellsFixed[row].shift();
					self.cellsFixed[row].push(temp);
				}
				self.rotationState = (self.rotationState + 360 / config.colCount) % 360;
				fieldView.updateCellColors(self.cellsFixed, self.cellsMoving);
				fieldView.updateRotationIndicator(self.rotationState);
			}
		},

		isFreeToMove: function(step) {
			if (!self.isStarted || self.isPaused || self.isOver) {
				return false;
			}
			for (var row = 0; row < config.rowCount; row++) {
				for (var col = 0; col < config.colCount; col++) {
					if (self.cellsMoving[row][col] != "none") {
						var colToTest = (col + step + config.colCount) % config.colCount;
						if (self.cellsFixed[row][colToTest] != "none") {
							return false;
						}
					}
				}
			}
			return true;
		},

		clearField: function() {
			self.cellsFixed = [];
			self.cellsMoving = [];
			for (var cellRow = 0; cellRow < config.rowCount; cellRow++) {
				var rowCellsFixed = [];
				var rowCellsMoving = [];
				for (var cellCol = 0; cellCol < config.colCount; cellCol++) {
					rowCellsFixed.push("none");
					rowCellsMoving.push("none");
				}
				self.cellsFixed.push(rowCellsFixed);
				self.cellsMoving.push(rowCellsMoving);
			}
			fieldView.updateCellColors(self.cellsFixed, self.cellsMoving);
			fieldView.updatePaused(self.isPaused);
			fieldView.updateRotationIndicator(self.rotationState);
			fieldView.updateGameOver(self.isOver);
			scoreDisplay.update(self.currentScore);
		},

		activateGravityTimer: function() {
			clearTimeout(self.gravityTimer);
			self.gravityTimer = setTimeout(self.gravityStep, Math.floor(self.gravityStepTime));
		},

		prepareNewStone: function() {
			var stoneTypes = ["none", "square", "rightS", "rightZ", "slat", "trapezium", "rightL", "mirrorL"];
			self.nextStoneType = stoneTypes[Math.ceil(Math.random()*(stoneTypes.length - 1))];
			fieldView.showPreview(self.nextStoneType);
		},

		insertPreparedStone: function() {
			var stonePieces = self.allStonePieces[self.nextStoneType];
			for (var i = 0; i < stonePieces.length; i++) {
				self.cellsMoving[stonePieces[i][0]][stonePieces[i][1]] = self.nextStoneType;
			}
			fieldView.updateCellColors(self.cellsFixed, self.cellsMoving);
			if (!self.canInsertStone()) {
				self.gameOver();
				return;
			}
			self.currentStoneCenter = {"row": 2, "col": 1};
			self.currentStoneType = self.nextStoneType;

			self.activateGravityTimer();
			self.prepareNewStone();
		},

		canInsertStone: function() {
			for (var row = 0; row < 4; row++) {
				for (var col = 0; col < config.colCount; col++) {
					if (self.cellsMoving[row][col] != "none") {
						if (self.cellsFixed[row][col] != "none") {
							return false;
						}
					}
				}
			}
			return true;
		},

		gameOver: function() {
			console.log("Game Over!");
			self.isOver = true;
			fieldView.updateGameOver(self.isOver);
			highscores.submitIfGoodEnough(self.currentScore);
		},

		gravityStep: function() {
			if (!(self.isStarted) || self.isPaused || self.isOver) {
				return;
			}
			self.moveStoneDown();
			self.gravityStepTime *= 0.998;
			clearTimeout(self.gravityTimer);
			self.activateGravityTimer();
		},

		moveStoneDown: function() {
			if (!self.isStarted || self.isPaused || self.isOver) {
				return;
			}
			if (self.downIsFree()) {
				for (var i = config.rowCount - 1; i > 0; i--) {
					for (var j = 0; j < config.colCount; j++) {
						self.cellsMoving[i][j] = self.cellsMoving[i - 1][j];
					}
				}
				for (var j = 0; j < config.colCount; j++) {
					self.cellsMoving[0][j] = "none"; //first row is now empty
				}
				self.currentStoneCenter.row += 1;
				self.activateGravityTimer();
			} else {
				self.fixCurrentStone();
				self.removeCompletedLines();
				self.insertPreparedStone();
			}
			fieldView.updateCellColors(self.cellsMoving, self.cellsFixed);
		},

		downIsFree: function() {
			for (var row = 0; row < config.rowCount; row++) {
				for (var col = 0; col < config.colCount; col++) {
					if (self.cellsMoving[row][col] != "none") {
						if (row == config.rowCount - 1) {
							return false;
						}
						if (self.cellsFixed[row + 1][col] != "none") {
							return false;
						}
					}
				}
			}
			return true;
		},

		fixCurrentStone: function() {
			for (var i = 0; i < config.rowCount; i++) {
				for (var j = 0; j < config.colCount; j++) {
					if (self.cellsMoving[i][j] != "none") {
						self.cellsFixed[i][j] = self.cellsMoving[i][j];
						self.cellsMoving[i][j] = "none";
					}
				}
			}
		},

		removeCompletedLines: function() {
			var completeRowsCount = 0;
			for (var rowIndex = 0; rowIndex < config.rowCount; rowIndex++) {
				if (self.rowIsComplete(rowIndex)) {
					completeRowsCount++;

					//all lines above move down by one
					for (var i = rowIndex; i > 0; i--) {
						for (var j = 0; j < config.colCount; j++) {
							self.cellsFixed[i][j] = self.cellsFixed[i - 1][j];
						}
					}

					//topmost line is empty
					for (var j = 0; j < config.colCount; j++) {
						self.cellsFixed[0][j] = "none";
					}
				}
			}
			self.currentScore += Math.pow(completeRowsCount, 3);
			scoreDisplay.update(self.currentScore);
		},

		rowIsComplete: function(rowIndex) {
			for (var j = 0; j < config.colCount; j++) {
				if (self.cellsFixed[rowIndex][j] == "none") {
					return false;
				}
			}
			return true;
		}
	};

}());
