"use strict";

var fieldView = (function() {
	var self = null;
	return {
		fieldSVG: null,
		rotationRing: null,
		cells: [],

		initialize: function() {
			self = this;

			self.fieldSVG = $("svg");
			self.rotationRing = $("rotationRing");
			self.createCells();
		},

		createCells: function() {
			var parent = $("cells");
			var cx = 50;
			var cy = 50;
			var angle = 2 * Math.PI / config.colCount;
			var rowHeight = Math.sin(angle/2);
			var r_outer = 46.7;
			var visibleRows = config.rowCount - 1;

			for (var i = 0; i < visibleRows; i++) {
				var rowCells = [];
				var r_outside = r_outer * Math.pow(1 - rowHeight, visibleRows - i);
				var r_inside = r_outer * Math.pow(1 - rowHeight, visibleRows - i - 1);
				for (var j = -1; j < config.colCount-1; j++) { //shift by -1 to make it easier to place blocks
					var x1, x2, x3, x4, y1, y2, y3, y4;
					x1 = cx + r_outside*Math.sin(j*angle - angle/2);
					y1 = cy + r_outside*Math.cos(j*angle - angle/2);
					x2 = cx + r_outside*Math.sin(j*angle + angle/2);
					y2 = cy + r_outside*Math.cos(j*angle + angle/2);
					x3 = cx + r_inside*Math.sin(j*angle + angle/2);
					y3 = cy + r_inside*Math.cos(j*angle + angle/2);
					x4 = cx + r_inside*Math.sin(j*angle - angle/2);
					y4 = cy + r_inside*Math.cos(j*angle - angle/2);

					var path = document.createElementNS("http://www.w3.org/2000/svg", "path");

					var pathCode = "M" + x1 + " " + y1;
					pathCode += "A" + r_outside + " " + r_outside + " 0 0 0 " + x2 + " " + y2;
					pathCode += "L" + x3 + " " + y3;
					pathCode += "A" + r_inside + " " + r_inside + " 0 0 1 " + x4 + " " + y4;
					pathCode += "z";

					path.setAttribute("d", pathCode);
					path.setAttribute("row", i);
					path.setAttribute("col", j+1);
					path.setAttribute("class", "cell");

					parent.appendChild(path);
					rowCells.push(path);
				}
				self.cells.push(rowCells);
			}

		},

		updateCellColors: function(gameCellsFixed, gameCellsMoving) {
			var visibleRows = config.rowCount - 1;
			for (var cellRow = 0; cellRow < visibleRows; cellRow++) {
				for (var cellCol = 0; cellCol < config.colCount; cellCol++) {
					var cellType = gameCellsMoving[cellRow + 1][cellCol];
					if (cellType == "none") {
						cellType = gameCellsFixed[cellRow + 1][cellCol];
					}
					self.cells[cellRow][cellCol].setAttribute("class", "cell " + cellType);
				}
			}
		},

		showPreview: function(stoneType) {
			self.hideAllPreviews();
			$(stoneType).style.display = "block";
		},

		hideAllPreviews: function() {
			var children = $("previews").childNodes;
			for (var i = 0; i < children.length; i++) {
				if(children[i].style) {
					children[i].style.display = "none";
				}
			}
		},

		updatePaused: function(isPaused) {
			if (isPaused) {
				$("pause").setAttribute("class", "isPaused");
			} else {
				$("pause").setAttribute("class", "");
			}
		},

		updateGameOver: function(isGameOver) {
			if (isGameOver) {
				$("gameOver").setAttribute("class", "isGameOver");
			} else {
				$("gameOver").setAttribute("class", "");
			}
		},

		updateRotationIndicator: function(rotationState) {
			$("rotationIndicator").setAttribute("transform", "rotate(" + rotationState + ",50,50)");
		}

	};

}());

