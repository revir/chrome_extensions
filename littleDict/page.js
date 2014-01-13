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

var loadingHtml = '<i class="icon-spinner icon-spin icon-2x pull-left"></i>正在查询...';

jQuery.scoped(); // Initialize the plugin

// jQuery(document.body).append('<div id="littleDict_wrapper"><style scoped> @import url(\'css/bootstrap.css\');  </style> <div id="littleDict_minidict"></div> </div>');
jQuery(document.body).append('<div class="littleDictDiv"><style scoped> </style> <div class="littleDictWrapper"></div> </div>');
// jQuery("#littleDict_wrapper").append('<div id="littleDict_minidict"></div>');
//initialize minidict
jQuery.get(chrome.extension.getURL('css/bootstrap.css'), function(cssdata) {
    jQuery('.littleDictDiv style').html(cssdata);
    jQuery.get(chrome.extension.getURL('css/font-awesome.css'), function(cssdata) {
        jQuery('.littleDictDiv style').append(cssdata);
        jQuery.get(chrome.extension.getURL('css/custom.css'), function(cssdata) {
            jQuery('.littleDictDiv style').append(cssdata);
            jQuery.get(chrome.extension.getURL('/minidict.html'), function(minidict_html) {
                var h = jQuery.parseHTML(minidict_html);
                jQuery('.littleDictWrapper').html(jQuery(h).filter('div#littleDict'));
                jQuery('.dict_query', h).click(function(event) {
                    var text = jQuery('.dict_input', h).val();
                    defineWord(text);
                });
            }, 'text');
        }, 'text');
    }, 'text');
}, 'text');

function parseAonaware(text) {
    var xmlobject = new DOMParser().parseFromString(text, "text/xml");
    jQuery('Definition', xmlobject).each(function() {
        var word = jQuery('Word', this).text(),
            dictName = jQuery('Dictionary Name', this).text(),
            meaning = jQuery('WordDefinition', this).text();
        console.log('dictName: ' + dictName);

        $('#littleDict .dict-result').text(meaning);

        return false;
    });
}

function parseDictCN(text) {
    // var xmlobject = new DOMParser().parseFromString(text, "text/xml");
    // var style = $('style', xmlobject).text();
    // var st = '<style scoped>'+style+'</stype>';
    var frame = document.createElement('iframe');
    frame.src = 'http://dict.cn';
    $('#littleDict .dict-result').append(res);
}

function parseIciba(text) {
    var d = $(document.createElement('div'));
    var xml = jQuery.parseXML(text);
    d.append('<h3></h3>');
    jQuery('ps', xml).each(function(index, el) {
        var t = jQuery(el).text();
        var audio = jQuery(el).next('pron').text();
        var n = '<span class="pron">' + t + '&nbsp<i class="icon-volume-up icon-middle sound"></i>' + '<audio src="' + audio + '"></audio>&nbsp&nbsp&nbsp&nbsp' + '</span>';
        jQuery('h3', d).append(n);
    });
    jQuery('.sound', d).click(function(e) {
        jQuery(this).next('audio')[0].play();
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
}

function defineWord(word) {
    if (!word)
        return;
    chrome.runtime.sendMessage({
        type: 'defineWord',
        word: word,
        dictName: 'iciba.com'
    }, function(response) {
        $('#littleDict .dict-result').html('');

        if (!response) {
            console.error('define word error!');
            $('#littleDict .dict-result').text('查询错误!');
            return;
        }

        if (response.dict.site === 'aonaware') {
            parseAonaware(response.data);
        } else if (response.dict.site === 'dict.cn') {
            parseDictCN(response.data);
        } else if (response.dict.site === 'iciba.com') {
            parseIciba(response.data);
        }
    });
}

function showMiniDict() {
    var selNode = window.getSelection();
    var text = selNode.toString();
    console.log('select words: ' + text);
    $('#littleDict .dict-result').html(loadingHtml);
    jQuery('#littleDict .dict_input').val(text);
    jQuery('#littleDict').modal({
        show: true
    });
    defineWord(text);
}
jQuery(document).mouseup(function() {
    if (window.getSelection().toString()) {
        chrome.runtime.sendMessage({
            type: 'ifEnable',
        }, function(enable) {
            if (enable) {
                showMiniDict();
            }
        });
    }
});

(function Init() {
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
                    showMiniDict();
            });
        }
    });
}());