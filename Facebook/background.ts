namespace Facebook.Backend {
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

        private status: Entities.Status;
        private unread: { [key: string]: string };

        constructor(settings: ISettings, loader: Api.ILoader, chrome: ChromeService) {
            this.settings = settings;
            this.loader = loader;
            this.chrome = chrome;
            this.timer = null;

            this.unread = {};
        }

        public start(): void {
            if (this.timer)
                return;
            this.timer = this.executeRepeatedly(() => {
                this.lazyStatus.then(status => {
                    Promise.all<Entities.FacebookEntity[]>([
                        this.loader.getMessagesAsync(status.token, status.profileUrl),
                        this.loader.getNotificationsAsync(status.token)
                    ]).then(entities => {
                        let allCounts: number = 0;

                        for (let entity of entities.reduce((previous, next) => previous.concat(next))) {
                            if (entity.state === Entities.State.Unseen ||
                                entity.state === Entities.State.Unread) {
                                allCounts++;
                                this.notifyOnce(entity instanceof Entities.Message ? entity.header : "New Notification", entity);
                            } else {
                                delete this.unread[entity.id];
                            }
                        }

                        this.chrome.updateUnreadCounter(allCounts);
                    }, (error: Error) => {
                        if (error.message === "rejected")
                            this.status = null;
                    });
                }, () => { });
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

        private get lazyStatus(): Promise<Entities.Status> {
            return this.status ? Promise.resolve(this.status) : this.loader.getStatusAsync().then(status => this.status = status);
        }

        private notifyOnce<T extends Entities.FacebookEntity>(title: string, entity: T): void {
            if (entity.text === this.unread[entity.id])
                return;
            this.loader.getExternalResourceAsync(entity.picture).then(localUrl => {
                entity.picture = localUrl;
                this.chrome.createDesktopAlert(title, entity);
            });
            this.playSound();
            this.unread[entity.id] = entity.text;
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
            if (chrome && chrome.browserAction) {
                chrome.browserAction.onClicked.addListener(() => {
                    this.createOrUpdateTab(`${this.settings.baseUrl}/`);
                });
            }

            if (chrome && chrome.notifications) {
                chrome.notifications.onClicked.addListener((id) => {
                    this.createOrUpdateTab(this.notifications[id]);
                    chrome.notifications.clear(id, () => { });
                    delete this.notifications[id];
                });
            }

            if (chrome && chrome.webRequest) {
                chrome.webRequest.onBeforeSendHeaders.addListener(details => {
                    var headers: chrome.webRequest.HttpHeader[] = details.requestHeaders;
                    var refererFound: boolean = false, originFound: boolean = false;

                    for (let header of headers) {
                        if (header.name === "Referer") {
                            header.value = this.settings.baseUrl;
                            refererFound = true;
                        }
                        if (header.name === "Origin") {
                            header.value = this.settings.baseUrl;
                            originFound = true;
                        }
                    }

                    if (!refererFound) headers.push({ name: "Referer", value: this.settings.baseUrl });
                    if (!originFound) headers.push({ name: "Origin", value: this.settings.baseUrl });

                    return { requestHeaders: headers };
                }, { urls: ["<all_urls>"] }, ["requestHeaders", "blocking"]);
            }
        }

        private createOrUpdateTab(url: string): void {
            if (chrome && chrome.tabs) {
                chrome.tabs.query({ url: url }, (tabs) => {
                    if (tabs.length > 0)
                        chrome.tabs.update(tabs[0].id, { url: url, active: true });
                    else
                        chrome.tabs.create({ url: url });
                });
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
            return new Promise<Entities.Status>((resolve, reject) => {
                $.ajax({
                    url: this.settings.baseUrl,
                    method: "GET",
                    accepts: "*/*"
                }).done((result: string) => {
                    resolve(this.parseStatus(result.replace(/<img\b[^>]*>/ig, "")));
                }).fail((jqXhr: JQueryXHR) => {
                    reject(new Error(jqXhr.state()));
                });
            });
        }

        public getNotificationsAsync(token: string): Promise<Entities.Notification[]> {
            return new Promise<Entities.Notification[]>((resolve, reject) => {
                $.ajax({
                    url: this.settings.baseUrl + Loader.NOTIFICATION_URI + this.settings.uriSuffix,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: { length: this.settings.fetchLimit, __a: 1, fb_dtsg: token }
                }).done((result: string) => {
                    resolve(this.parseNotifications(JSON.parse((result).match(/{.*}/)[0]).payload));
                }).fail((jqXhr: JQueryXHR) => {
                    reject(new Error(jqXhr.state()));
                });
            });
        }

        public getMessagesAsync(token: string, profileUrl: string): Promise<Entities.Message[]> {
            return new Promise<Entities.Message[]>((resolve, reject) => {
                $.ajax({
                    url: this.settings.baseUrl + Loader.MESSAGE_URI + this.settings.uriSuffix,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: { "inbox[offset]": 0, "inbox[limit]": this.settings.fetchLimit, __a: 1, fb_dtsg: token }
                }).done((result: string) => {
                    resolve(this.parseMessages(JSON.parse((result).match(/{.*}/)[0]).payload, profileUrl));
                }).fail((jqXhr: JQueryXHR) => {
                    reject(new Error(jqXhr.state()));
                });
            });
        }

        public getExternalResourceAsync(url: string): Promise<string> {
            // TODO only on success
            return new Promise<string>(resolve => {
                if (this.localResources[url])
                    resolve(this.localResources[url]);
                const xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        this.localResources[url] = window.URL.createObjectURL(xhr.response);
                        resolve(this.localResources[url]);
                    } else {
                        resolve(this.settings.notificationIcon);
                    }
                };
                xhr.send(null);
            });
        }

        private parseStatus(result: any): Entities.Status {
            // TODO better counts
            const $result: JQuery = $(result);
            const token: string = result.match(/name="fb_dtsg" value="(.*?)" autocomplete/)[1];
            const notificationsCount: number = parseInt($(result).find("#notificationsCountValue").text());
            const messageCount: number = parseInt($result.find("#mercurymessagesCountValue").text());
            const profileUrl: string = ($result.find("a[title='Profile']")[0] as HTMLLinkElement).href;

            return new Entities.Status(token, notificationsCount, messageCount, profileUrl);
        }

        private parseNotifications(json: any): Entities.Notification[] {
            // TODO try catch + handling
            return (json.nodes as Array<any>).map(notification => {
                const authors: Entities.Author[] = (notification.actors as Array<any>).map(author => new Entities.Author(author.name, author.profile_picture.uri));
                const type: Entities.Type = this.parseNotificationType(notification.notif_type);
                const state: Entities.State = this.parseNotificationState(notification.seen_state);
                const timestamp: string = this.formTimestampText(notification.timestamp.text, json.servertime - notification.timestamp.time);
                const attachment: string = (notification.attachments.length > 0 && notification.attachments[0].media) ?
                    notification.attachments[0].media.image.uri : null;

                return new Entities.Notification(notification.id, notification.title.text, authors, authors[0].profilePicture, type, state, timestamp, notification.url, notification.icon.uri, attachment);
            });
        }

        private parseMessages(json: any, profileUrl: string): Entities.Message[] {
            // TODO try catch + handling
            const participants: { [id: string]: Entities.Author; } = {};
            let userId: string;
            for (let participant of json.participants) {
                participants[participant.id] = new Entities.Author(participant.name, participant.big_image_src, participant.short_name);
                if (participant.href === profileUrl)
                    userId = participant.id;
            }
            return (json.threads as Array<any>).map(message => {
                const authors: Entities.Author[] = (message.participants as Array<string>).filter(participantId => participantId !== userId).map(participantId => participants[participantId]);
                const header: string = message.name.length === 0 ? authors.map(author => author.fullName).join(", ") : message.name;
                const text: string = authors.length === 1 ? message.snippet : `${participants[message.snippet_sender].shortName}: ${message.snippet}`;
                const picture: string = message.name.length === 0 ? authors[0].profilePicture : participants[message.snippet_sender].profilePicture;
                const state: Entities.State = message.unread_count === 0 ? Entities.State.Read : Entities.State.Unread;
                const prefix: string = message.participants.length <= 2 ? this.settings.simpleMessagePrefix : this.settings.complexMessagePrefix;
                const url: string = this.settings.baseUrl + prefix + message.thread_fbid;

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
                `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) !== 1 ? "s" : ""} ago`;
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