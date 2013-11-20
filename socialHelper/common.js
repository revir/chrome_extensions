jQuery.noConflict();

//wait for some ajax content on the page to finish loading, then run the process.
function waitForAjax(selector, context, process, time) {
	var interval = 1000; //ms
	var timeOut = time || 10000; //ms
	var id = 0,
		el = [];
	var doPage = function() {
		console.log('waitForAjax...');
		timeOut -= interval;
		el = jQuery(selector, context);
		if (el.length >= 1 || timeOut <= 0) {
			window.clearInterval(id);
			process(timeOut > 0);
		}
	};

	id = window.setInterval(doPage, interval);
}

function autoKeypress(element) {
	var e = new KeyboardEvent('KeyboardEvent');
	e.initKeyboardEvent('keypress');
	element.dispatchEvent(e);
}