DesktopNotifications = {

  DEFAULT_FADEOUT_DELAY: 20000,
  CLOSE_ON_CLICK_DELAY: 300,
  
  COUNTER_BLINK_DELAY: 250,

  notifications: {},
  _timer: null,

  PERMISSION_ALLOWED: 0,
  PERMISSION_NOT_ALLOWED: 1,
  PERMISSION_DENIED: 2,

  getEndpoint: '/desktop_notifications/popup.php',
  countsEndpoint: '/desktop_notifications/counts.php',
  domain: '',
  protocol: '',

  _interval: null,

  _latest_notif: 0,
  _latest_read_notif: 0,
  _ignore_notif: {},

  _num_unread_notif: 0,
  _num_unread_inbox: 0,

  fb_dtsg: '',

  _sound: null,
  _sound_playing: false,

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

    self._sound_playing = false;
    self._handleNotifInfo(serverInfo.notifications);
    self._handleInboxInfo(serverInfo.inbox);
  },

  _handleNotifInfo: function(notifInfo) {
    var self = DesktopNotifications;
    if (!notifInfo || notifInfo.no_change) {
      return;
    }
    if (self._num_unread_notif + Object.keys(self._ignore_notif).length <= notifInfo.num_unread) {
      if (self._latest_notif < notifInfo.latest) {
        self._latest_notif = notifInfo.latest;
        self._latest_read_notif = notifInfo.latest_read;
        self._ignore_notif = notifInfo.unread;
        self._num_unread_notif = notifInfo.num_unread;
        self.addNotificationByType('Notifications');
      }
    } else {
      for (var ignored in self._ignore_notif)
        if (!notifInfo.unread.hasOwnProperty(ignored))
          delete self._ignore_notif[ignored];
      self._num_unread_notif = notifInfo.num_unread - Object.keys(self._ignore_notif).length;
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
        self.addNotificationByType('Inbox');
        self.playSound();
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
      var attributes = self['parse' + type + 'Attributes'](result);
      
      for (var i = 0; i < attributes.length; i++) {
        chrome.notifications.create(attributes[i][0], {
          type: "basic",
          title: "Facebook - New Messages in " + type,
          message: attributes[i][2],
          iconUrl: "images/icon48.png"
        }, function(id) {
          self.restartTimer(self.DEFAULT_FADEOUT_DELAY);
        });
        self.notifications[attributes[i][0]] = attributes[i][1];
        delete self._ignore_notif[attributes[i][0]];
      };
      if (type === 'Notifications') {
        self._num_unread_notif = attributes.length;
        self.updateUnreadCounter();
        if (self._num_unread_notif > 0)
          self.playSound();
      };
    }, function(e, uri) { /* do nothing */ });
  },

  parseNotificationsAttributes: function(result) {
    var self = DesktopNotifications;
    var attributes = [];
    var dom = self.wrap(result, 'html');
    var liElements = dom.getElementsByClassName('jewelItemNew');
    for (var i = liElements.length - 1; i >= 0; i--) {
      var notificationId = liElements[i].id;
      var target = liElements[i].getElementsByTagName('a')[0].href;
      var divs = liElements[i].getElementsByTagName('div');
      for (var j = 0; j < divs.length; j++) {
        if (divs[j].id && divs[j].id.indexOf(notificationId) == 0)
          var message = divs[j].innerText;
      };
      attributes.push([notificationId, target, message]);
    };
    return attributes;
  },

  parseInboxAttributes: function(result) {
    var self = DesktopNotifications;
    var attributes = [];
    var dom = self.wrap(result, 'html');
    var liElements = dom.getElementsByClassName('jewelItemNew');
    for (var i = liElements.length - 1; i >= 0; i--) {
      var target = self.protocol + self.domain + '/messages' + 
                   liElements[i].getElementsByTagName('a')[0].search;
      var divs = liElements[i].getElementsByClassName('content')[0].childNodes;
      var notificationId = divs[0].innerText;
      var message = '';
      for (var j = 0; j < divs.length; j++)
        message += divs[j].innerText + '\n';
      attributes.push([notificationId, target, message]);
    };
    return attributes;
  },

  expireNotifications: function() {
    for (var id in DesktopNotifications.notifications)
      chrome.notifications.clear(id, function() {});
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
  },

  playSound: function() {
    var self = DesktopNotifications;
    if (!self._sound_playing) {
      self._sound_playing = true;
      if (!self._sound)
        self._sound = new Audio('chime.ogg');
      self._sound.play();
    }
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