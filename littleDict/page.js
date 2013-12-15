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

jQuery.scoped(); // Initialize the plugin

// jQuery(document.body).append('<div id="littleDict_wrapper"><style scoped> @import url(\'css/bootstrap.css\');  </style> <div id="littleDict_minidict"></div> </div>');
jQuery(document.body).append('<div id="littleDict_wrapper"><style scoped> </style> <div id="littleDict_minidict"></div> </div>');
// jQuery("#littleDict_wrapper").append('<div id="littleDict_minidict"></div>');
//initialize minidict
jQuery.get(chrome.extension.getURL('css/bootstrap.css'), function(cssdata) {
	jQuery('#littleDict_wrapper style').html(cssdata);

	jQuery.get(chrome.extension.getURL('/minidict.html'), function(minidict_html) {
		jQuery('#littleDict_minidict').html(minidict_html);
	}, 'text');

}, 'text');

function parseAonaware(text) {
	var xmlobject = new DOMParser().parseFromString(text, "text/xml");
	jQuery('Definition', xmlobject).each(function() {
		var word = jQuery('Word', this).text(),
			dictName = jQuery('Dictionary Name', this).text(),
			meaning = jQuery('WordDefinition', this).text();
		console.log('dictName: ' + dictName);


		$('#littleDict_minidict #minidictLabel').text(dictName);
		$('#littleDict_minidict .modal-body').text(meaning);

		// jQuery(selNode.baseNode.parentNode).popover({
		// 	trigger: 'manual',
		// 	title: word + '----' + dictName,
		// 	// selector: 'h1 a',
		// 	content: meaning
		// }).popover('show');

		jQuery('#minidict').modal({
			show: true
		});
		return false;
	});
}

jQuery(document).mouseup(function() {
	var selNode = window.getSelection();
	var sel = selNode.toString();
	if (sel.length) {
		console.log('select words: ' + sel);
		chrome.runtime.sendMessage({
			type: 'defineWord',
			word: sel
		}, function(response) {
			if (!response) {
				console.error('define word error!');
			} else {
				parseAonaware(response);
			}
		});
	}
});