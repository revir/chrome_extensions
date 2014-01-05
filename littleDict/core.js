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

var allDicts = [{
	'dictId': 'dict.cn',
	'dictName': 'dict.cn',
	'site': 'dict.cn'
}, {
	'dictId': 'wn',
	'dictName': 'WordNet (r) 2.0',
	'site': 'aonaware'
}, {
	'dictId': 'iciba.com',
	'dictName': 'iciba.com',
	'site': 'iciba.com'
}];

function postToAonaware(word, dictId, onSuccess, onFail) {
	var url = 'http://services.aonaware.com/DictService/DictService.asmx/DefineInDict';
	var obj = {
		dictId: dictId,
		word: word
	};
	$.post(url, obj, onSuccess, 'text').fail(onFail).error(onFail);
}

function postToDictCN(word, onSuccess, onFail) {
	var url = 'http://dict.cn/mini.php';
	var obj = {
		q: word
	};
	$.post(url, obj, onSuccess, 'text').fail(onFail).error(onFail);
}

function postToCiba(word, onSuccess, onFail) {
	var url = 'http://dict-co.iciba.com/api/dictionary.php';
	var obj = {
		w: word,
		key: '0AAE477DB66EC58D12E1451877045CA5'
	};
	$.get(url, obj, onSuccess, 'text').fail(onFail).error(onFail);
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.type === 'defineWord') {
			console.log('defineWord: ' + request.word);
			var dict = allDicts[0];
			if (request.dictName) {
				var res = allDicts.filter(function(d) {
					return d.dictName === request.dictName;
				});
				dict = res.length ? res[0] : dict;
			}
			var onSuccess = function(data) {
				console.log(data);
				sendResponse({
					data: data,
					dict: dict
				});
			};
			var onFail = function() {
				console.error('send request to web service failed!');
				sendResponse(false);
			};

			if (dict.site === 'dict.cn') {
				postToDictCN(request.word, onSuccess, onFail);
			} else if (dict.site === 'aonaware') {
				postToAonaware(request.word, dict.dictId, onSuccess, onFail);
			} else if(dict.site === 'iciba.com'){
				postToCiba(request.word, onSuccess, onFail);
			}
			return true;
		}
	}
);