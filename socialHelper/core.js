var _post_data = {};
console.info('[temp] core init...');

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type === 'postToSocial') {
			_post_data = jQuery.extend(true, {}, request);
			setTimeout(function() {
				console.info('timeout: _post_data will be cleared');
				_post_data = {};
			}, request.keepTime);

			jQuery.each(_post_data.socialWebSite, function(index, url) {
				chrome.tabs.create({
					url: url
				});
			});
		} else if (request.type === 'getInfo') {
			console.info('getInfo event: '+request.url);
			var t = jQuery.extend(true, {}, _post_data);
			sendResponse(t);
		} else if (request.type === 'postDone') {
			if (request.url) {
				console.info('postDone event: ' + request.url);
				if (!_post_data.socialWebSite) {
					console.info('but the _post_data is already empty.');
					return;
				}
				var i = _post_data.socialWebSite.indexOf(request.url);
				if (i !== -1) {
					_post_data.socialWebSite.splice(i, 1);
				}
				if (_post_data.socialWebSite.length === 0) {
					_post_data = {};
				}
			}
		}
	});