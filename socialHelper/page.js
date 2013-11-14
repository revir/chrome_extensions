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
	if (pNode.hasClass('social_weibo')) {
		data.socialWebSite[data.socialWebSite.length] = 'http://weibo.com';
	}

	chrome.runtime.sendMessage(data);
	// window.close();
}

function checkWeiboLogin(data) {
	if (!/\/u\//.test(location.pathname)) {
		alert('you didn\'t login yet, please login in ' + data.keepTime / (60 * 1000) + ' minutes, otherwise it will be timeout.');
		return false;
	}
	return true;
}

function processWeibo(data) {
	waitForAjax('textarea.input_detail', '', function(success) {
		if (!success) {
			if (checkWeiboLogin(data)) {
				alert('Cannot find the input area');
				return;
			}
			return;
		}
		var textArea = jQuery('textarea.input_detail'),
			sendBtn = jQuery('a.send_btn');
		if (!textArea.length || !sendBtn.length) {
			alert('Cannot find the input area or send button');
			return;
		}
		textArea[0].value = data.content;
		textArea[0].focus();
		//[temp]
		//sendBtn[0].click();
		console.info('post to weibo successfully!');
		chrome.runtime.sendMessage({
			type: 'postDone',
			url: location.origin
		});
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
					if (location.origin === 'http://weibo.com') {
						return processWeibo(response);
					}
				}
			}
			console.log('nothing');
		});
	}
});