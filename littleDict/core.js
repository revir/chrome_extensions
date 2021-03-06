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
    'dictName': 'dict.cn',
    'entry': 'DictCN'
}, {
    'dictName': 'WordNet (r) 2.0',
    'entry': 'Aonaware',
    'baseUrl': 'http://services.aonaware.com/DictService/DictService.asmx/DefineInDict',
    'queryType': 'post',
    'params': {
        'dictId': 'wn'
    },
    'queryKey': 'word'
}, {
    'dictName': 'iciba.com',
    'entry': 'Iciba',
    'baseUrl': 'http://dict-co.iciba.com/api/dictionary.php',
    'queryType': 'get',
    'params': {
        'key': '0AAE477DB66EC58D12E1451877045CA5'
    },
    'queryKey': 'w'
}];

function setBrowserIcon(enable) {
    var title = '已打开鼠标取词功能',
        imgPath = 'images/icon-on19.png';
    if (!enable) {
        title = '已关闭鼠标取词功能';
        imgPath = 'images/icon-off19.png';
    }
    chrome.browserAction.setTitle({
        title: title
    });
    chrome.browserAction.setIcon({
        path: imgPath
    });
}

(function Init() {
    if (Settings.getValue('enableMinidict') === undefined) {
        Settings.setValue('enableMinidict', true);
    }
    setBrowserIcon(Settings.getValue('enableMinidict'));
}());

chrome.browserAction.onClicked.addListener(function(tab) {
    var b = !Settings.getValue('enableMinidict');
    Settings.setValue('enableMinidict', b);
    setBrowserIcon(b);
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'ifEnable') {
            sendResponse(Settings.getValue('enableMinidict'));
        } else if (request.type === 'keySettings') {
            sendResponse({
                specialKeys: 'ctrl,shift',
                normalKey: 'X'
            });
        } else if (request.type === 'dictList') {
            sendResponse(allDicts);
        } else if (request.type === 'defineWord') {
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

            var params = $.extend(true, {}, dict.params);
            params[dict.queryKey] = request.word;
            $[dict.queryType](dict.baseUrl, params, onSuccess, 'text').fail(onFail).error(onFail);
            
            return true;
        }
    }
);