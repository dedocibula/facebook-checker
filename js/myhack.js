function removeWarnings() {
	var script = document.body.getElementsByTagName('script')[0];
	while (script && script.nextElementSibling.nodeName != "SCRIPT") {
		script.nextElementSibling.parentNode.removeChild(script.nextElementSibling);
	}
}

function getWindowHeight() {
	var jewels = document.getElementsByClassName('jewel');
	if (jewels.length != 0)
		chrome.runtime.sendMessage({ 'resizeWindow': jewels[0].offsetHeight });
}

function changeAllMessagesUrl() {
	var anchor = document.getElementsByClassName('seeMore')[0];
	if (anchor.firstChild.innerText == 'See All Messages')
		anchor.href = 'https://www.facebook.com/messages';
}

removeWarnings();

setTimeout(function() {
	getWindowHeight();
	changeAllMessagesUrl();
}, 50);