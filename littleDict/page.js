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

var manager = {};
manager.loadingHtml = '<i class="icon-spinner icon-spin icon-2x pull-left"></i>正在查询...';
manager.parseAonaware = function(text) {
    var xmlobject = new DOMParser().parseFromString(text, "text/xml");
    jQuery('Definition', xmlobject).each(function() {
        var word = jQuery('Word', this).text(),
            dictName = jQuery('Dictionary Name', this).text(),
            meaning = jQuery('WordDefinition', this).text();
        console.log('dictName: ' + dictName);

        $('#littleDict .dict-result').text(meaning);

        return false;
    });
};

manager.parseIciba = function(text) {
    var d = $(document.createElement('div'));
    var xml = jQuery.parseXML(text);
    d.append('<h4></h4>');
    jQuery('ps', xml).each(function(index, el) {
        var t = jQuery(el).text();
        var audio = jQuery(el).next('pron').text();
        var n = '<span class="pron">' + t + '&nbsp<i class="fa fa-volume-up icon-middle sound"></i>' + '<audio src="' + audio + '"></audio>&nbsp&nbsp&nbsp&nbsp' + '</span>';
        jQuery('h4', d).append(n);
    });

    jQuery('pos', xml).each(function(i, el) {
        var m = $(el).next('acceptation').text();
        var s = '<p>' + $(el).text() + '<b>' + m + '</b>' + '</p>';
        d.append(s);
    });
    jQuery('orig, fy', xml).each(function(i, el) {
        var m = $(el).next('trans').text();
        var s = '<p class="example"><i class="icon-coffee"></i>' + $(el).text() + '</p>';
        var s2 = '<p>' + m + '</p>';
        d.append(s);
        d.append(s2);
    });
    $('#littleDict .dict-result').append(d);
};

manager.parseDictCN = function(word) {
    var src = "http://dict.cn/mini.php?q=" + word;
    var frameStr = '<iframe src="' + src + '"></iframe>';
    $('#littleDict .dict-result').append(frameStr);
};

manager.queryDict = function(word, dictName) {
    if (!word)
    //TODO： display sth
        return;
    if (dictName === 'dict.cn') {
        $('#littleDict .dict-result').html('');
        manager.parseDictCN(word);
    } else {
        chrome.runtime.sendMessage({
            type: 'defineWord',
            word: word,
            dictName: dictName
        }, function(response) {
            $('#littleDict .dict-result').html('');
            if (!response) {
                console.error('define word error!');
                $('#littleDict .dict-result').text('查询错误!');
                return;
            }
            manager['parse' + response.dict.entry](response.data);
        });
    }
};

manager.updateDictList = function(dictList) {
    $('#littleDict .dict_list').html('');
    $.each(dictList, function(index, dict) {
        var t = '<li><a class="dict_item">' + dict.dictName + '</a></li>';
        $('#littleDict .dict_list').append(t);
    });
    var defaultName = dictList[0].dictName;
    $('#littleDict .dict_name').text(defaultName);
    return defaultName;
};

manager.showMiniDict = function() {
    var selNode = window.getSelection();
    var text = selNode.toString();
    console.log('select words: ' + text);
    $('#littleDict .dict-result').html(manager.loadingHtml);
    jQuery('#littleDict .dict_input').val(text);
    jQuery('#littleDict').modal({
        show: true
    });
    if ($('#littleDict .dict_list .dict_item').length) {
        var dictName = $('#littleDict .dict_name').text();
        manager.queryDict(text, dictName);
    } else {
        chrome.runtime.sendMessage({
            type: 'dictList',
        }, function(datas) {
            if (datas && datas.length) {
                var defaultDictName = manager.updateDictList(datas);
                manager.queryDict(text, defaultDictName);
            }
        });
    }
};

// jQuery(document.body).append('<div id="littleDict_wrapper"><style scoped> @import url(\'css/bootstrap.css\');  </style> <div id="littleDict_minidict"></div> </div>');
jQuery(document.body).append('<div class="littleDictWrapper"> </div>');
// jQuery("#littleDict_wrapper").append('<div id="littleDict_minidict"></div>');
//initialize minidict
jQuery.get(chrome.extension.getURL('/minidict.html'), function(minidict_html) {
    var h = jQuery.parseHTML(minidict_html);
    var mainNode = jQuery(h).filter('div#littleDict');
    jQuery('.littleDictWrapper').append(mainNode);
    mainNode.click(function(event) {
        var node = jQuery(event.target);
        var _queryDict = function() {
            var text = jQuery('.dict_input', mainNode).val();
            var dictName = jQuery('.dict_name', mainNode).text();
            manager.queryDict(text, dictName);
        };
        if (node.is('.dict_list li a')) {
            $('.dict_name', mainNode).text(node.text());
            _queryDict();
        }
        if (node.is('.dict_query')) {
            _queryDict();
        }
        if (node.is('.sound')) {
            var a = node.next('audio');
            if (a.length)
                a[0].play();
        }
    });
}, 'text');

jQuery(document).mouseup(function() {
    if (window.getSelection().toString()) {
        chrome.runtime.sendMessage({
            type: 'ifEnable',
        }, function(enable) {
            if (enable) {
                manager.showMiniDict();
            }
        });
    }
});

(function Init() {
    // var d = $.fn.dropdown.noConflict();
    // $.fn.dpd = d;

    chrome.runtime.sendMessage({
        type: 'keySettings',
    }, function(datas) {
        if (datas) {
            console.log('getKeySettings...');
            jQuery(document).bind('keydown', function(event) {
                var b = true;
                jQuery.each(datas.specialKeys.split(','), function(i, v) {
                    if (!event[v + 'Key'])
                        b = false;
                });
                if (event.keyCode !== datas.normalKey.charCodeAt(0))
                    b = false;
                if (b)
                    manager.showMiniDict();
            });
        }
    });
}());