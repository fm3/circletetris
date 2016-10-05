"use strict";

var popups = (function() {
	var self;

	return {
		shownPopupId: null,

		initialize: function() {
			self = this;
			$("popup-backdrop").onclick = self.hide;
			$("popup-close-button").onclick = self.hide;
		},

		hideIfPresent: function(popupId) {
			if (self.shownPopupId == popupId) {
				self.hide();
			}
		},

		show: function(popupId) {
			gamePlay.pause();
			document.body.classList.add("popupShown");
			$(popupId).classList.add("shown");
			self.shownPopupId = popupId;
		},

		isShown: function() {
			return (self.shownPopupId !== null);
		},

		hide: function() {
			if (self.shownPopupId === null) {
				return;
			}
			document.body.classList.remove("popupShown");
			$(self.shownPopupId).classList.remove("shown");
			self.shownPopupId = null;
		}
	};

}());
