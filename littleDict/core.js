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

console.info('[temp] core init...');

aonawareUrl = 'http://services.aonaware.com/DictService/DictService.asmx/DefineInDict';

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type === 'defineWord') {
			console.log('defineWord: '+request.word);
			$.get(aonawareUrl, {
					dictId: 'wn',
					word: request.word
				},
				function(data) {
					console.log(data);
					sendResponse(data);
				}, 'text').fail(function() {
					console.error('aonaware: define word failed!');
					sendResponse(false);
			});
			return true;
		}
	}
);