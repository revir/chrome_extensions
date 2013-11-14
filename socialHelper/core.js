var _post_data = null;

function updatePostData(data) {
	if (data)
		_post_data = jQuery.extend(true, {}, data);
	else
		_post_data = null;
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type === 'postToSocial') {
			updatePostData(request);
			setTimeout(function(){
				console.log('timeout: _post_data will be cleared');
				updatePostData({});
			}, request.keepTime);
			chrome.tabs.create({
				url: request.socialWebSite
			});
		} else if (request.type === 'getInfo') {
			sendResponse(_post_data);
		} else if (request.type === 'postDone') {
			if(request.weibo)
				delete _post_data.weibo;
		}
	});