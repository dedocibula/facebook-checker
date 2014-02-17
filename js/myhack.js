window.onload = function() {
	var script = document.querySelectorAll('[data-signature]')[0];
	while (script && script.nextElementSibling.nodeName != "SCRIPT") {
		script.nextElementSibling.parentNode.removeChild(script.nextElementSibling);
	}
	var jewels = document.getElementsByClassName('jewel');
	if (jewels.length != 0)
		chrome.runtime.sendMessage({ 'resizeWindow': jewels[0].offsetHeight });
};