function removeWarnings() {
	var script = document.body.getElementsByTagName('script')[0];
	while (script && script.nextElementSibling.nodeName != "SCRIPT") {
		script.nextElementSibling.parentNode.removeChild(script.nextElementSibling);
	}
}

function getWindowHeight() {
	var jewels = document.getElementsByClassName('jewel');
	if (jewels.length != 0)
		chrome.runtime.sendMessage({ 'resizeWindow': jewels[0].offsetHeight + 1 });
}

function changeAllMessagesUrl() {
	var anchor = document.getElementsByClassName('seeMore')[0];
	if (anchor.firstChild.innerText == 'See All Messages')
		anchor.href = 'https://www.facebook.com/messages';
}

function enableReadButtons() {
	var containers = document.getElementsByClassName('notification');
	for (var i = 0; i < containers.length; i++)
		containers[i].style.position = 'relative';

	var readButtons = document.getElementsByClassName('notif_x_div');
	for (var i = 0; i < readButtons.length; i++) {
		readButtons[i].classList.add('notification-read-div');
		readButtons[i].firstChild.className = 'notification-read-button';
	}
}

function fixHighlight() {
	var links = document.querySelectorAll('#jewelCase .jewelHighlightItem li a');
	for (var i = 0; i < links.length; i++)
		links[i].classList.add('link');
}

removeWarnings();
enableReadButtons();
fixHighlight();

setTimeout(function() {
	getWindowHeight();
	changeAllMessagesUrl();
}, 50);