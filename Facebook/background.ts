module Facebook.Backend {
    interface ISettings {
        baseUrl: string;
        uriSuffix: string;
        refreshInterval: number;
        fetchLimit: number;
        notificationFadeoutDelay: number;
        simpleMessagePrefix: string;
        complexMessagePrefix: string;
        sound: string;
        contextMessage: string;
        notificationIcon: string;
    }

    class BackgroundWorker {
        private settings: ISettings;
        private loader: Api.ILoader;
        private chrome: ChromeService;
        private timer: number;
        private sound: HTMLAudioElement;

        constructor(settings: ISettings, loader: Api.ILoader, chrome: ChromeService) {
            this.settings = settings;
            this.loader = loader;
            this.chrome = chrome;
            this.timer = null;
        }

        public start(): void {
            if (this.timer)
                return;
            this.timer = this.executeRepeatedly(() => {
                this.loader.getStatusAsync().then(status => {
                    var token: string = status.token;
                    var allCounts: number = status.messageCount + status.notificationCount;

                    if (status.messageCount > 0) {
                        this.loader.getMessagesAsync(token).then(messages => {
                            messages.forEach(message => {
                                this.playSound();
                                if (message.state === Entities.State.Unread) {
                                    this.loader.getExternalResourceAsync(message.picture).then(localUrl => {
                                        message.picture = localUrl;
                                        this.chrome.createDesktopAlert(message.header, message);
                                    });
                                }
                            });
                        });
                    } else if (status.notificationCount > 0) {
                        this.loader.getNotificationsAsync(token).then(notifications => {
                            notifications.forEach(notification => {
                                this.playSound();
                                if (notification.state === Entities.State.Unseen ||
                                    notification.state === Entities.State.Unread) {
                                    this.loader.getExternalResourceAsync(notification.picture).then(localUrl => {
                                        notification.picture = localUrl;
                                        this.chrome.createDesktopAlert("New Notification", notification);
                                    });
                                }
                            });
                        });
                    }

                    this.chrome.updateUnreadCounter(allCounts);
                });
            }, this.settings.refreshInterval);
        }

        public stop(): void {
            if (!this.timer)
                return;
            clearInterval(this.timer);
            this.timer = null;
        }

        private executeRepeatedly(action: () => void, interval: number): number {
            action();
            return setInterval(action, interval);
        }

        private playSound(): void {
            if (!this.sound)
                this.sound = new Audio(this.settings.sound);
            this.sound.play();
        }
    }

    class ChromeService {
        private settings: ISettings;
        private notifications: { [id: number]: string };

        constructor(settings: ISettings) {
            this.settings = settings;
            this.notifications = {};

            this.registerListeners();
        }

        public createDesktopAlert<T extends Entities.FacebookEntity>(title: string, entity: T): void {
            if (chrome && chrome.notifications) {
                chrome.notifications.create(entity.id, {
                    type: "basic",
                    title: title,
                    message: entity.text,
                    contextMessage: this.settings.contextMessage,
                    iconUrl: entity.picture
                }, (id) => {
                    setTimeout(() => {
                        chrome.notifications.clear(id, () => { });
                        delete this.notifications[id];
                    }, this.settings.notificationFadeoutDelay);
                });

                this.notifications[entity.id] = entity.url;
            }
        }

        public updateUnreadCounter(value: number): void {
            if (chrome && chrome.browserAction)
                chrome.browserAction.setBadgeText({ text: value > 0 ? value.toString() : "" });
        }

        private registerListeners(): void {
            if (chrome && chrome.notifications) {
                chrome.notifications.onClicked.addListener((id) => {
                    var url = this.notifications[id];
                    chrome.tabs.query({ url: url }, (tabs) => {
                        if (tabs.length > 0)
                            chrome.tabs.update(tabs[0].id, { url: url, active: true });
                        else
                            chrome.tabs.create({ url: url });
                    });
                    chrome.notifications.clear(id, () => { });
                    delete this.notifications[id];
                });
            }

            if (chrome && chrome.webRequest) {
                chrome.webRequest.onBeforeSendHeaders.addListener(details => {
                    var headers: chrome.webRequest.HttpHeader[] = details.requestHeaders;
                    var refererFound: boolean = false, originFound: boolean = false;

                    for (var i = 0; i < headers.length; i++) {
                        if (headers[i].name === "Referer") {
                            headers[i].value = this.settings.baseUrl;
                            refererFound = true;
                        }
                        if (headers[i].name === "Origin") {
                            headers[i].value = this.settings.baseUrl;
                            originFound = true;
                        }
                    }

                    if (!refererFound) headers.push({ name: "Referer", value: this.settings.baseUrl });
                    if (!originFound) headers.push({ name: "Origin", value: this.settings.baseUrl });

                    return { requestHeaders: headers };
                }, { urls: ["<all_urls>"] }, ["requestHeaders", "blocking"]);
            }
        }
    }

    class Loader implements Api.ILoader {
        private static get NOTIFICATION_URI(): string { return "/ajax/notifications/client/get.php"; }
        private static get MESSAGE_URI(): string { return "/ajax/mercury/threadlist_info.php"; }

        private settings: ISettings;
        private localResources: { [url: string]: string };

        constructor(settings: ISettings) {
            this.settings = settings;
            this.localResources = {};
        }

        public getStatusAsync(): Promise<Entities.Status> {
            return new Promise<Entities.Status>(resolve => {
                $.ajax({
                    url: this.settings.baseUrl,
                    method: "GET",
                    accepts: "*/*"
                }).done((result: string) => {
                    resolve(this.parseStatus(result.replace(/<img\b[^>]*>/ig, "")));
                });
            });
        }

        public getNotificationsAsync(token: string): Promise<Entities.Notification[]> {
            return new Promise<Entities.Notification[]>(resolve => {
                $.ajax({
                    url: this.settings.baseUrl + Loader.NOTIFICATION_URI + this.settings.uriSuffix,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: { length: this.settings.fetchLimit, __a: 1, fb_dtsg: token }
                }).done((result: string) => {
                    resolve(this.parseNotifications(JSON.parse((result).match(/{.*}/)[0]).payload));
                });
            });
        }

        public getMessagesAsync(token: string): Promise<Entities.Message[]> {
            return new Promise<Entities.Message[]>(resolve => {
                $.ajax({
                    url: this.settings.baseUrl + Loader.MESSAGE_URI + this.settings.uriSuffix,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: { "inbox[offset]": 0, "inbox[limit]": this.settings.fetchLimit, __a: 1, fb_dtsg: token }
                }).done((result: string) => {
                    resolve(this.parseMessages(JSON.parse((result).match(/{.*}/)[0]).payload));
                });
            });
        }

        public getExternalResourceAsync(url: string): Promise<string> {
            return new Promise<string>(resolve => {
                if (this.localResources[url])
                    resolve(this.localResources[url]);
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.onload = () => {
                    this.localResources[url] = window.URL.createObjectURL(xhr.response);
                    resolve(this.localResources[url]);
                };
                xhr.send(null);
            });

        }

        private parseStatus(result: any): Entities.Status {
            var $result: JQuery = $(result);
            var token = result.match(/name="fb_dtsg" value="(.*?)" autocomplete/)[1];
            var notificationsCount = parseInt($(result).find("#notificationsCountValue").text());
            var messageCount = parseInt($result.find("#mercurymessagesCountValue").text());
            return new Entities.Status(token, notificationsCount, messageCount);
        }

        private parseNotifications(json: any): Entities.Notification[] {
            return (<Array<any>>(json.nodes)).map(notification => {
                var authors: Entities.Author[] = (<Array<any>>(notification.actors)).map(author => new Entities.Author(author.name, author.profile_picture.uri));
                var type: Entities.Type = this.parseNotificationType(notification.notif_type);
                var state: Entities.State = this.parseNotificationState(notification.seen_state);
                var timestamp: string = this.formTimestampText(notification.timestamp.text, json.servertime - notification.timestamp.time);
                var attachment: string = (notification.attachments.length > 0 && notification.attachments[0].media) ?
                    notification.attachments[0].media.image.uri : null;

                return new Entities.Notification(notification.id, notification.title.text, authors, authors[0].profilePicture, type, state, timestamp, notification.url, notification.icon.uri, attachment);
            });
        }

        private parseMessages(json: any): Entities.Message[] {
            var participants: { [id: string]: Entities.Author; } = {};
            (<Array<any>>(json.participants)).forEach(participant => {
                participants[participant.id] = new Entities.Author(participant.name, participant.big_image_src, participant.short_name);
            });
            return (<Array<any>>(json.threads)).map(message => {
                var mainAuthor: Entities.Author = participants[`fbid:${message.thread_fbid}`];
                var header: string = message.name.length === 0 ? mainAuthor.fullName : message.name;
                var text: string = message.name.length === 0 ? message.snippet : `${participants[message.snippet_sender].shortName}: ${message.snippet}`;
                var authors: Entities.Author[] = (<Array<string>>(message.participants)).map(participantId => participants[participantId]);
                var picture: string = message.name.length === 0 ? mainAuthor.profilePicture : participants[message.snippet_sender].profilePicture;
                var state: Entities.State = message.unread_count === 0 ? Entities.State.Read : Entities.State.Unread;
                var prefix: string = message.participants.length <= 2 ? this.settings.simpleMessagePrefix : this.settings.complexMessagePrefix;
                var url: string = this.settings.baseUrl + prefix + message.thread_fbid;

                return new Entities.Message(message.thread_id, header, text, authors, picture, state, message.timestamp_relative, url);
            });
        }

        private parseNotificationType(type: string): Entities.Type {
            // TODO sanitize
            switch (type) {
                case "group_activity":
                    return Entities.Type.GroupActivity;
                case "birthday_reminder":
                    return Entities.Type.BirthdayReminder;
                case "fbpage_fan_invite":
                    return Entities.Type.PageFanInvite;
                case "admin_plan_mall_activity":
                    return Entities.Type.AdminPlanMallActivity;
                case "event_comment_mention":
                    return Entities.Type.EventCommentMention;
                case "feed_comment":
                    return Entities.Type.FeedComment;
                case "like":
                    return Entities.Type.Like;
                case "like_tagged":
                    return Entities.Type.LikeTagged;
                case "login_alerts_new_device":
                    return Entities.Type.LoginAlert;
                case "mentions_comment":
                    return Entities.Type.MentionsComment;
                case "photo_tag":
                    return Entities.Type.PhotoTag;
                case "plan_user_invited":
                    return Entities.Type.PlanUserInvited;
                case "poke":
                    return Entities.Type.Poke;
                case "tagged_with_story":
                    return Entities.Type.TaggedWithStory;
                case "wall":
                    return Entities.Type.Wall;
                default:
                    return null;
            }
        }

        private parseNotificationState(text: string): Entities.State {
            switch (text) {
                case "UNSEEN_AND_UNREAD":
                    return Entities.State.Unseen;
                case "SEEN_BUT_UNREAD":
                    return Entities.State.Unread;
                case "SEEN_AND_READ":
                    return Entities.State.Read;
                default:
                    return null;
            }
        }

        private formTimestampText(text: string, timeInSeconds: number): string {
            if (text && text.length !== 0)
                return text;
            var minutes: number = Math.floor(timeInSeconds / 60);
            return (minutes < 60) ?
                `${minutes} minute${minutes !== 1 ? "s" : ""} ago` :
                `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) !== 1 ? "s" : ""} ago`;;
        }
    }

    window.onload = () => {
        var settings: ISettings = {
            baseUrl: "https://www.facebook.com",
            uriSuffix: "?__pc=EXP1%3ADEFAULT",
            refreshInterval: 20 * 1000,
            notificationFadeoutDelay: 10 * 1000,
            fetchLimit: 7,
            simpleMessagePrefix: "/messages/",
            complexMessagePrefix: "/messages/conversation-",
            sound: "chime.ogg",
            contextMessage: "www.facebook.com",
            notificationIcon: "Images/icon48.png"
        };

        var loader: Api.ILoader = new Loader(settings);
        var chrome: ChromeService = new ChromeService(settings);
        var worker: BackgroundWorker = new BackgroundWorker(settings, loader, chrome);
        worker.start();
    };
}