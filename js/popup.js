window.options.init();
var current = window.options.current;

var DesktopNotifications = chrome.extension.getBackgroundPage().DesktopNotifications;

function resizeWindow(height) {
  var iframe = document.getElementById('iframe');
  // necessary to dynamically resize
  iframe.style.height =
    document.body.style.height =
      document.documentElement.style.height = height + 'px';
}

function updateUnreadCounter() {
  DesktopNotifications.fetchServerInfo(
    function(serverInfo) {
      DesktopNotifications.handleServerInfo(serverInfo);
      DesktopNotifications.showActiveIcon();
    },
    DesktopNotifications.showInactiveIcon,
    true // no_cache after clicking popup
  );
}

function loadIframe() {
  var iframe = document.getElementById('iframe');
  var source = current.protocol + current.domain + current.popupEndpoint;
  source += '?mark_as_read=' + current.markAsRead || '';
  source += '&fb_dtsg=' + DesktopNotifications.fb_dtsg || '';
  source += '&type=' + (DesktopNotifications.getPopupType &&
    DesktopNotifications.getPopupType()) || '';
  iframe.onload = updateUnreadCounter;
  iframe.src = source;
  return iframe;
}

function loadIframeByPost() {
  var iframe = document.getElementById('iframe');
  var form = document.getElementById('form');

  var fb_dtsg = document.getElementById('fb_dtsg');
  fb_dtsg.value = DesktopNotifications.fb_dtsg || '';

  var mark_as_read = document.getElementById('mark_as_read');
  mark_as_read.value = current.markAsRead || '';

  var type = document.getElementById('type');
  type.value = (DesktopNotifications.getPopupType &&
    DesktopNotifications.getPopupType()) || '';

  var source = current.protocol + current.domain + current.popupEndpoint;
  form.setAttribute('action', source);

  iframe.onload = updateUnreadCounter;
  form.submit();
  return iframe;
}

function displayError(e) {
  var error = document.getElementsByClassName('error')[0];
  error.style.display = 'block';
  var errormsg = document.getElementById('errormsg');
  errormsg.innerHTML = 'An error occurred: ' + e;
  var iframe = document.getElementById('iframe');
  iframe.style.display = 'none';
}

chrome.webRequest.onHeadersReceived.addListener(
    function(info) {
        var headers = info.responseHeaders;
        for (var i=headers.length-1; i>=0; --i) {
            var header = headers[i].name.toLowerCase();
            if (header == 'x-frame-options' || header == 'frame-options') {
                headers.splice(i, 1); // Remove header
            }
        }
        return {responseHeaders: headers};
    },
    {
        urls: [ '*://*/*' ], // Pattern to match all http(s) pages
        types: [ 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
);

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      if (message) {
        for (var key in message)
          this[key](message[key]);
      }
    }
);

try {
  if (!DesktopNotifications.fb_dtsg) {
    DesktopNotifications.fetchServerInfo(
      function(serverInfo) {
        DesktopNotifications.handleServerInfo(serverInfo);
        DesktopNotifications.showActiveIcon();
        loadIframe();
      },
      DesktopNotifications.showInactiveIcon);
  } else {
    loadIframe();
  }
} catch (e) {
  displayError(e);
}