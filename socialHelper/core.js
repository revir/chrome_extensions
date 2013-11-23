// #######################################################################
//  Copyright (C) 2013 revir.qing@gmail.com
// 
//  This program is free software; you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation; either version 2, or (at your option)
//  any later version.
// 
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
// 
//  You should have received a copy of the GNU General Public License
//  along with this program; if not, write to the Free Software Foundation,
//  Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.  
//  
//  Author: Revir Qing (aguidetoshanghai.com)
//  URL: www.aguidetoshanghai.com

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
			sendResponse('good');
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