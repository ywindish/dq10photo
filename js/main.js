(function(){

var DQXPhoto = {

	baseUrl: 'http://hiroba.dqx.jp', 
	charListName: 'charlist',
	charId: null,

	download: function() {
		this.requestPhotoPage(0, function(resultPage){
			var regex = new RegExp('\/sc\/character\/' + DQXPhoto.charId + '\/picture\/page\/([0-9]+)', "g");
			var pageUrl;
			var maxPageNo;
			while ((pageUrl = regex.exec(resultPage)) != null) {
				maxPageNo = pageUrl[1];
			}
			for (var page = 0; page <= maxPageNo; page++) {
				DQXPhoto.downloadPhotos(page);
			}
		});
	},

	downloadPhotos: function(page) {
		this.requestPhotoPage(page, function(resultPage) {		
			var regexString =
				DQXPhoto.escapeRegExp('http://img.dqx.jp/smpicture/download/webpicture/' + DQXPhoto.charId + '/thum2/')
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
				DQXPhoto.downloadFile(photoUrls[i].url, photoUrls[i].id);
			}
		});
	},

	downloadFile: function(url, filename) {
		var link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
		link.href = url;
		link.download = filename 
		var event = document.createEvent("MouseEvents");
		event.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		link.dispatchEvent(event);
	},

	requestPhotoPage: function(page, func) {
		if (/^[0-9]{1}$/g.test(page) == false) {
			page = '0'; // page is 0-9
		}
		var url = this.baseUrl + '/sc/character/' + this.charId + '/picture/page/' + page;
		$.get(url, func);
	},

	loadCharacterList: function() {
		var url = this.baseUrl + '/sc/home/characterchange/';
		$.get(url, function(resultPage) {
			var regex = new RegExp('([0-9]+)\.png" \/> ([^<]+)<\/td>', "g");
			var matchText;
			while ((matchText = regex.exec(resultPage)) != null) {
				var charId = matchText[1];
				var charName = matchText[2];
				var $label = $('<label class="radio"> ' + charName + '</label>'); // bootstrap
				var $input = $('<input type="radio">').val(charId).attr({
					id: charId,
					name: DQXPhoto.charListName
				});
				$('#character_list').append($label.append($input))
					.append('<br/>');
			}
		});
	},

	isCharacterSelected: function() {
		return $('input:checked[name=' + this.charListName + ']').length > 0;
	},
	
	// see: https://developer.mozilla.org/ja/docs/JavaScript/Guide/Regular_Expressions
	escapeRegExp: function(string) {
		return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1");
	}
}

$(document).ready(function() {

	$("#download").click(function() {
		DQXPhoto.charId = 
			$("input:checked[name=" + DQXPhoto.charListName + "]").val();
		DQXPhoto.download();
	});

	$("#character_list").click(function() {
		$("#download").attr("disabled", ! DQXPhoto.isCharacterSelected());
	});

	DQXPhoto.loadCharacterList();
	if ($('#character_list').children('input:radio')) {
		$("#warning").css("display", "none");
	}

});

})();
