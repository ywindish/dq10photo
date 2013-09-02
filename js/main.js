(function() {

var DQXPhoto = {

	baseUrl: 'http://hiroba.dqx.jp', 
	charId: null,
	charName: null,

	download: function() {
		var _this = this;
		this.requestPhotoPage(0, function(resultPage){
			// /sc/character/1234567890/picture/page/0
			var regex = new RegExp('\/sc\/character\/' + _this.charId + '\/picture\/page\/([0-9]+)', "g");
			var pageUrl;
			var maxPageNo;
			while ((pageUrl = regex.exec(resultPage)) != null) {
				maxPageNo = pageUrl[1];
			}
			for (var page = 0; page <= maxPageNo; page++) {
				_this.downloadPhotos(page);
			}
		}, this);
	},

	downloadPhotos: function(page) {
		var _this = this;
		this.requestPhotoPage(page, function(resultPage) {
			var regexString =
				_this.escapeRegExp('http://img.dqx.jp/smpicture/download/webpicture/' + _this.charId + '/thum2/')
				+ '([0-9]+)\/';
			var regex = new RegExp(regexString, "g");
			var photoUrls = new Array();
			var _thumUrl;
			while ((_thumUrl = regex.exec(resultPage)) != null) {
				photoUrls.push({
					url: _thumUrl[0].replace('thum2', 'original'),
					id: _thumUrl[1]
				});
			}
			for (var i = 0; i < photoUrls.length; i++) {
				_this.downloadFile(photoUrls[i].url, photoUrls[i].id);
			}
		}, this);
	},

	downloadFile: function(url, filename) {
		var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
		link.href = url;
		link.download = filename 
		var event = document.createEvent("MouseEvents");
		event.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		link.dispatchEvent(event);
	},

	requestPhotoPage: function(page, func, _this) {
		if (/^[0-9]{1}$/g.test(page) == false) {
			page = '0'; // page is 0-9
		}
		var url = _this.baseUrl + '/sc/character/' + _this.charId + '/picture/page/' + page;
		$.get(url, func);
	},

	loadCharacterInfo: function() {
		var url = this.baseUrl + '/sc/home/';
		var _this = this;
		$.get(url, function(resultPage) {
			// <img src="http://hiroba.dqx.jp/sc/character/{charId}/img/bup/" alt="{charName}" />
			var pattern = '<img src\="http\:\/\/hiroba.dqx.jp\/sc\/character\/([0-9]+)\/img\/bup\/" alt\="([^"]+)" />';
			var regex = new RegExp(pattern, 'g');
			var matchText;
			while ((matchText = regex.exec(resultPage)) != null) {
				_this.charId = matchText[1];
				_this.charName = matchText[2];
			}
			if (_this.charId !== null) {
				$('#character_name').text(_this.charName);
				$("#warning").css("display", "none");
			}
			$("#download").attr("disabled", _this.charId === null);
		});
	},

	// see: https://developer.mozilla.org/ja/docs/JavaScript/Guide/Regular_Expressions
	escapeRegExp: function(string) {
		return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
	}
};

$(document).ready(function() {
	$("#download").click(function() {
		DQXPhoto.download();
	});

	DQXPhoto.loadCharacterInfo();
});

})();
