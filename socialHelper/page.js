var gsite = {};
gsite.weibo_host = 'http://weibo.com';
gsite.twitter_host = "https://twitter.com";
gsite.googleplus_host = 'https://plus.google.com';

function processFile() {
	var pNode = jQuery('#social_helper_div .social_helper_p');
	if (!pNode.length) {
		alert('cannot find the content node!');
		return;
	}
	var data = {};
	data.type = 'postToSocial';
	data.content = pNode.text();
	data.keepTime = 5 * 60 * 1000;
	data.socialWebSite = [];
	console.log(data.content);
	if (pNode.hasClass('weibo')) {
		data.socialWebSite[data.socialWebSite.length] = gsite.weibo_host;
	}
	if (pNode.hasClass('twitter')) {
		data.socialWebSite[data.socialWebSite.length] = gsite.twitter_host;
	}
	if (pNode.hasClass('googleplus')) {
		data.socialWebSite[data.socialWebSite.length] = gsite.googleplus_host;
	}

	chrome.runtime.sendMessage(data, function(msg){
		window.close();
	});
}

function processWeibo(data) {
	var checkWeiboLogin = function(data) {
		if (!/\/u\//.test(location.pathname)) {
			alert('you didn\'t login weibo yet, please login in ' + data.keepTime / (60 * 1000) + ' minutes, otherwise it will be timeout.');
			return false;
		}
		return true;
	};
	waitForAjax('textarea.input_detail', '', function(success) {
		if (!success) {
			if (checkWeiboLogin(data)) {
				alert('Cannot find the input area on weibo');
				return;
			}
			return;
		}
		var textArea = jQuery('textarea.input_detail'),
			sendBtn = jQuery('a.send_btn');
		if (!textArea.length || !sendBtn.length) {
			alert('Cannot find the input area or send button on weibo');
			return;
		}
		textArea[0].focus();
		textArea[0].value = data.content;
		autoKeypress(textArea[0]);
		
		setTimeout(function(){
			sendBtn = jQuery('a.send_btn');
			sendBtn[0].click();
			console.info('post to weibo successfully!');
			chrome.runtime.sendMessage({
				type: 'postDone',
				url: location.origin
			});
		}, 2000);
	});

}

function processTwitter(data) {
	var checkLogin = function() {
		if (jQuery('#signin-link').length) {
			alert('you didn\'t login twitter yet, please login in ' + data.keepTime / (60 * 1000) + ' minutes, otherwise it will be timeout.');
			return false;
		}
		return true;
	};

	waitForAjax('#tweet-box-mini-home-profile', '', function(success) {
		if (!success) {
			if (checkLogin()) {
				alert('Cannot find the input area on twitter');
				return;
			}
			return;
		}
		var node = jQuery('#tweet-box-mini-home-profile');
		var tbtn = jQuery('div.home-tweet-box button.js-tweet-btn');
		if (!node.length || !tbtn.length) {
			alert('Cannot find the input area or send button on twitter');
			return;
		}
		node[0].focus();
		node[0].innerText = data.content;

		setTimeout(function() {
			var tbtn = jQuery('div.home-tweet-box button.js-tweet-btn');
			tbtn[0].click();
			console.info('post to twitter successfully!');
			chrome.runtime.sendMessage({
				type: 'postDone',
				url: location.origin
			});
		}, 1000);
	});
}

function processGooglePlus(data) {
	var checkLogin = function() {
		if (/account/.test(location.origin)) {
			alert('you didn\'t login google yet, please login in ' + data.keepTime / (60 * 1000) + ' minutes, otherwise it will be timeout.');
			return false;
		}
		return true;
	};

	waitForAjax('div[guidedhelpid="sharebox_textarea"]', '', function(success) {
		if (!success) {
			if (checkLogin()) {
				alert('Cannot find the input area on google plus');
				return;
			}
			return;
		}
		var node = jQuery('div[guidedhelpid="sharebox_textarea"]');
		node[0].click();
		setTimeout(function() {
			var textArea = jQuery('div[g_editable="true"]');
			var btn = jQuery('div[guidedhelpid="sharebutton"]');
			if (!textArea.length || !btn.length) {
				alert('Cannot find the input area or send button on twitter');
				return;
			}
			autoKeypress(textArea[0]);
			textArea[0].innerText = data.content;
			setTimeout(function() {
				btn[0].click();

				console.info('post to google plus successfully!');
				chrome.runtime.sendMessage({
					type: 'postDone',
					url: location.origin
				});
			}, 1000);

		}, 1000);
	});
}

jQuery(document).ready(function() {
	if (location.protocol === 'file:') {
		processFile();
	} else {
		chrome.runtime.sendMessage({
			type: 'getInfo',
			url: location.origin
		}, function(response) {
			if (response && response.socialWebSite && response.socialWebSite.length) {
				if (response.socialWebSite.indexOf(location.origin) !== -1) {
					console.log('origin: ' + location.origin);
					if (location.origin === gsite.weibo_host) {
						return processWeibo(response);
					} else if (location.origin === gsite.twitter_host) {
						return processTwitter(response);
					} else if (location.origin === gsite.googleplus_host) {
						return processGooglePlus(response);
					}
				}
			}
			console.log('nothing, url: '+location.origin);
		});
	}
});