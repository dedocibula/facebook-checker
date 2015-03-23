var fb_dtsg;

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

function getFb_dtsgValue() {
	fb_dtsg = fb_dtsg || document.getElementsByName('fb_dtsg')[0].value;
	return fb_dtsg;
}

function enableReadButtons() {
	var containers = document.getElementsByClassName('notification');
	for (var i = 0; i < containers.length; i++) {
		containers[i].style.position = 'relative';
		_display(containers[i], 'mouseover', 'block');
		_display(containers[i], 'mouseout', 'none');
	}

	var readButtons = document.getElementsByClassName('notif_x_div');
	for (var i = 0; i < readButtons.length; i++) {
		readButtons[i].classList.add('notification-read-div');
		readButtons[i].firstChild.className = 'notification-read-button';
		readButtons[i].firstChild.title = 'Read';
		_bindRead(readButtons[i].firstChild);
	}
}

function fixHighlight() {
	var links = document.querySelectorAll('#jewelCase .jewelHighlightItem li a');
	for (var i = 0; i < links.length; i++)
		links[i].classList.add('link');
}

function _bindRead(element) {
	element.addEventListener('click', function() {
		var parentElement = this.parentNode.parentNode;
		if (!parentElement.classList.contains('jewelItemNew'))
			return;
		var metadata = JSON.parse(parentElement.dataset.gt);
		var url = _formUrl(metadata.alert_id);
		_ajax('GET', url, _updateUnreadCounter,	console.log);
		_invalidate(parentElement, metadata);
	});
}

function _ajax(method, url, success, failure) {
	var ajaxRequest = new XMLHttpRequest();
	ajaxRequest.onreadystatechange = function() {
		if (ajaxRequest.readyState === 4) {
			if (ajaxRequest.status === 200)
				success();
			else
				failure(ajaxRequest.statusText);
		}
	};
	ajaxRequest.open(method, url, true);
	ajaxRequest.send();
}

function _formUrl(alertId) {
	return 'https://www.facebook.com/ajax/notifications/mark_read.php' +
		'?alert_ids%5B0%5D=' + alertId +
		'&fb_dtsg=' + getFb_dtsgValue() + 
		'&from_read_button=true';
}

function _invalidate(newItem, metadata) {
	metadata.unread = '0';
	parentElement.classList.remove('jewelItemNew');
	parentElement.dataset.gt = JSON.stringify(metadata);
}

function _updateUnreadCounter() {
	chrome.runtime.sendMessage({ 'updateUnreadCounter': null });
}

function _display(element, event, value) {
	element.addEventListener(event, function() {
		this.lastChild.style.display = value;
	});
}

removeWarnings();
enableReadButtons();
fixHighlight();

setTimeout(function() {
	getWindowHeight();
	changeAllMessagesUrl();
}, 50);