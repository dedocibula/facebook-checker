DesktopNotifications = {

  DEFAULT_FADEOUT_DELAY: 20000,
  CLOSE_ON_CLICK_DELAY: 300,
  
  COUNTER_BLINK_DELAY: 250,

  notifications: {},
  _timer: null,

  PERMISSION_ALLOWED: 0,
  PERMISSION_NOT_ALLOWED: 1,
  PERMISSION_DENIED: 2,

  getEndpoint: '/desktop_notifications/get.php',
  countsEndpoint: '/desktop_notifications/counts.php',
  domain: '',
  protocol: '',

  _interval: null,

  _latest_notif: 0,
  _latest_read_notif: 0,

  _num_unread_notif: 0,
  _num_unread_inbox: 0,

  fb_dtsg: '',

  /**
   * Start polling for notifications.
   */
  start: function(refresh_time) {
    var self = DesktopNotifications;
    if (refresh_time < self.DEFAULT_FADEOUT_DELAY) {
      refresh_time = self.DEFAULT_FADEOUT_DELAY;
    }

    self.stop();
    self.showActiveIcon();
    self.fetchServerInfo(self.handleServerInfo, self.showInactiveIcon);

    self._interval = setInterval(function() {
      self.fetchServerInfo(
        function(serverInfo) {
          self.handleServerInfo(serverInfo);
          self.showActiveIcon();
        },
        self.showInactiveIcon);
    }, refresh_time);
  },

  /**
   * Get the best popup type to show.
   */
  getPopupType: function() {
    var self = DesktopNotifications;

    var type = 'notifications';
    if (self._num_unread_inbox && !self._num_unread_notif) {
      type = 'inbox';
    }
    return type;
  },

  /**
   * Stop polling.
   */
  stop: function() {
    clearInterval(DesktopNotifications._interval);
    DesktopNotifications.showInactiveIcon();
  },

  /**
   * Updates icon in Chrome extension to normal blue icon
   */
  showActiveIcon: function() {
    if (chrome && chrome.browserAction) {
      chrome.browserAction.setIcon({path: '/images/icon19.png'});
    }
  },

  /**
   * Updates icon in Chrome extension to gray icon and clears badge.
   */
  showInactiveIcon: function() {
    if (chrome && chrome.browserAction) {
      chrome.browserAction.setBadgeText({text: ''});
      chrome.browserAction.setIcon({path: '/images/icon-loggedout.png'});
    }
  },

  /**
   * Fetches metadata from the server on the current state of the user's
   * notifications and inbox.
   */
  fetchServerInfo: function(callback, errback, no_cache) {
    callback = callback || function(d) { console.log(d); };
    errback = errback || function(u, e) { console.error(u, e); };
    var self = DesktopNotifications;
    var uri = self.protocol + self.domain + self.countsEndpoint +
      '?latest=' + self._latest_notif +
      '&latest_read=' + self._latest_read_notif;
    if (no_cache) {
      uri += '&no_cache=1';
    }
    self._fetch(
      uri,
      function(json) {
        callback(JSON.parse(json));
      },
      errback
    );
  },

  _fetch: function(uri, callback, errback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", uri, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        try {
          if (xhr.status == 200) {
            return callback(xhr.responseText);
          } else {
            throw 'Status ' + xhr.status + ': ' + xhr.responseText;
          }
        } catch (e) {
          errback(e, uri);
        }
      }
    };
    xhr.send(null);
  },

  /**
   * Decides whether to fetch any items for display depending on data from
   * server on unread counts.
   */
  handleServerInfo: function(serverInfo) {
    var self = DesktopNotifications;
    // update CSRF token
    self.fb_dtsg = serverInfo.fb_dtsg;

    self._handleNotifInfo(serverInfo.notifications);
    self._handleInboxInfo(serverInfo.inbox);
  },

  _handleNotifInfo: function(notifInfo) {
    var self = DesktopNotifications;
    if (!notifInfo || notifInfo.no_change) {
      return;
    }
    if (self._num_unread_notif !== notifInfo.num_unread) {
      if (self._latest_notif < notifInfo.latest) {
        self._latest_notif = notifInfo.latest;
        self._latest_read_notif = notifInfo.latest_read;
        self.addNotificationByType('notifications');
      }
      self._num_unread_notif = notifInfo.num_unread;
      self.updateUnreadCounter();
    }
  },

  _handleInboxInfo: function(inboxInfo) {
    var self = DesktopNotifications;
    if (!inboxInfo) {
      return;
    }
    if (inboxInfo.unread !== self._num_unread_inbox) {
      if (inboxInfo.unread > self._num_unread_inbox) {
        self.addNotificationByType('inbox');
      }
      self._num_unread_inbox = inboxInfo.unread;
      self.updateUnreadCounter();
    }
  },

  /**
   * Updates "badge" in Chrome extension toolbar icon.   
   */
  updateUnreadCounter: function() {
    var self = DesktopNotifications;
    if (chrome && chrome.browserAction) {
      // first set the counter to empty
      chrome.browserAction.setBadgeText({text: ''});
      // wait, then set it to new value
      setTimeout(function() {
          // don't show a zero
          var num = (self.getUnreadCount() || '') + '';
          chrome.browserAction.setBadgeText({text: num});
        },
        self.COUNTER_BLINK_DELAY,
        false
        );
    }
  },

  getUnreadCount: function() {
    var self = DesktopNotifications;
    return self._num_unread_notif + self._num_unread_inbox;
  },

  addNotificationByType: function(type) {
    var self = DesktopNotifications;
    var uri = self.protocol + self.domain + self.getEndpoint +
      '?type=' + (type || '');
    
    self._fetch(uri, function(result) {
      var capType = type.charAt(0).toUpperCase() + type.slice(1);
      var attributes = self['parse' + capType + 'Attributes'](result);
      
      chrome.notifications.create(attributes[0], {
        type: "basic",
        title: "Facebook - New Messages in " + capType,
        message: attributes[2],
        iconUrl: "images/icon48.png"
      }, function(id) {
        self.notifications[id] = attributes[1];
        self.restartTimer(self.DEFAULT_FADEOUT_DELAY);
      });
    }, function(e, uri) { /* do nothing */ });
  },

  /**
   * Adds a new notification to the queue.
   * After an expiration period, it is closed.
   */
  // addNotification: function(alert_id, delay) {
  //   var self = DesktopNotifications;
  //   if (!window.webkitNotifications) {
  //     return;
  //   }

  //   if (typeof delay == 'undefined') {
  //     delay = self.DEFAULT_FADEOUT_DELAY;
  //   }
  //   var uri = self.protocol + self.domain + self.getEndpoint +
  //     '?alert_id=' + (alert_id || '') +
  //     '&latest=' + self._latest_notif +
  //     '&latest_read=' + self._latest_read_notif;
  //   var notification =
  //     window.webkitNotifications.createHTMLNotification(uri);

  //   // In case the user has multiple windows or tabs open, replace
  //   // any existing windows for this alert with this one.
  //   notification.replaceId = 'com.facebook.alert.' + alert_id;

  //   self.showNotification(notification, delay);
  // },

  parseNotificationsAttributes: function(result) {
    var self = DesktopNotifications;
    var dom = self.wrap(result, 'html');
    var liElement = dom.getElementsByTagName('li')[0];
    var notificationId = liElement.id;
    var target = liElement.getElementsByTagName('a')[0].href;
    var divs = liElement.getElementsByTagName('div');
    for (var i = 0; i < divs.length; i++) {
      if (divs[i].id && divs[i].id.indexOf(notificationId) == 0)
        var message = divs[i].innerText;
    };
    return [notificationId, target, message];
  },

  parseInboxAttributes: function(result) {
    var self = DesktopNotifications;
    var dom = self.wrap(result, 'html');
    var liElement = dom.getElementsByTagName('li')[0];
    var target = self.protocol + self.domain + '/messages' + 
                 liElement.getElementsByTagName('a')[0].search;
    var divs = liElement.getElementsByClassName('content')[0].childNodes;
    var notificationId = divs[0].innerText;
    var message = '';
    for (var i = 0; i < divs.length; i++) {
      message += divs[i].innerText + '\n';
    };
    return [notificationId, target, message];
  },

  expireNotifications: function() {
    DesktopNotifications.notifications.forEach(function(id) { 
      chrome.notifications.clear(id, null);
    });
    DesktopNotifications.notifications = {};
    DesktopNotifications._timer = null;
  },

  restartTimer: function(extraTime) {
    if (DesktopNotifications._timer) {
      clearTimeout(DesktopNotifications._timer);
    }
    DesktopNotifications._timer = setTimeout(function() {
      DesktopNotifications.expireNotifications();
    }, extraTime);
  },

  updateTab: function(href) {
    chrome.tabs.query({ url: href }, function(tabs) {
        if (tabs.length !== 0) {
            chrome.tabs.update(tabs[0].id, { url: href, active: true });
        } else {
            chrome.tabs.create({ url: href });
        }
    });
  },

  wrap: function(string, element) {
    var node = document.createElement(element);
    node.innerHTML = string;
    return node;
  }
};

window.options.init();
var current = window.options.current;
chrome.notifications.onClicked.addListener(function(id) {
  var target = DesktopNotifications.notifications[id];
  DesktopNotifications.updateTab(target);
});

DesktopNotifications.protocol = current.protocol;
DesktopNotifications.domain = current.domain;
DesktopNotifications.start(current.refreshTime);