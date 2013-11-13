jQuery(document).ready(function() {
	if (location.protocol === 'file:') {
		var pNode = jQuery('#social_helper_div .social_helper_p');
		if (!pNode.length) {
			alert('cannot find the content node!');
			return;
		}
		var data = {};
		data.type = 'postToSocial';
		data.content = pNode.text();
		console.log(content);
		if(pNode.hasClass('social_weibo'))
			data.weibo =  true;

		chrome.runtime.sendMessage(data);
		// window.close();
	}
});