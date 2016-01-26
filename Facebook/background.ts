module Facebook.Backend {
    interface ISettings {
        baseUrl: string;
        refreshInterval: number;
    }

    class BackgroundWorker {
        private settings: ISettings;
        private loader: Api.ILoader;

        constructor(settings: ISettings, loader: Api.ILoader) {
            this.settings = settings;
            this.loader = loader;
        }

        public start(): void {
            this.loader.getStatusAsync().then(status => {
                // TODO
            });
        }
    }

    class Loader implements Api.ILoader {
        private static get NOTIFICATION_URI(): string { return "/ajax/notifications/client/get.php?__pc=EXP1%3ADEFAULT"; }

        private baseUrl: string;

        constructor(settings: ISettings) {
            this.baseUrl = settings.baseUrl;
        }

        public getStatusAsync(): Promise<Entities.Status> {
            return new Promise<Entities.Status>(resolve => {
                $.ajax({
                    url: this.baseUrl,
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
                    url: this.baseUrl + Loader.NOTIFICATION_URI,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: { length: 7, __a: 1, fb_dtsg: token }
                }).done((result: string) => {
                    resolve(this.parseNotifications(JSON.parse((result).match(/{.*}/)[0]).payload));
                });
            });
        }

        public getMessagesAsync(token: string): Promise<Entities.Message[]> {
            throw new Error("Not implemented");
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

                var timestamp: string;
                if (notification.timestamp.text && notification.timestamp.text.length !== 0) {
                    timestamp = notification.timestamp.text;
                } else {
                    var minutes: number = (json.servertime - notification.timestamp.time) / 60;
                    timestamp = (minutes < 60) ?
                        `${Math.floor(minutes)} minute${Math.floor(minutes) !== 1 ? "s" : ""} ago` :
                        `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) !== 1 ? "s" : ""} ago`;
                }

                var attachment: string = (notification.attachments.length > 0 && notification.attachments[0].media) ?
                    notification.attachments[0].media.image.uri : null;

                return new Entities.Notification(notification.id, notification.title.text, authors, type, timestamp, notification.url, notification.icon.uri, attachment);
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

        private retrieveTimestamp(text: string, timeInSeconds: number): string {
            if (text && text.length !== 0)
                return text;
            var minutes: number = Math.floor(timeInSeconds / 60);
            return (minutes < 60) ? `${Math.floor(minutes)} minutes ago` : `${Math.floor(minutes / 60)} hours ago`;
        }
    }

    function registerListeners(settings: ISettings): void {
        chrome.webRequest.onBeforeSendHeaders.addListener(details => {
            var headers: chrome.webRequest.HttpHeader[] = details.requestHeaders;
            var refererFound: boolean = false, originFound: boolean = false;

            for (var i = 0; i < headers.length; i++) {
                if (headers[i].name === "Referer") {
                    headers[i].value = settings.baseUrl;
                    refererFound = true;
                }
                if (headers[i].name === "Origin") {
                    headers[i].value = settings.baseUrl;
                    originFound = true;
                }
            }

            if (!refererFound) headers.push({ name: "Referer", value: settings.baseUrl });
            if (!originFound) headers.push({ name: "Origin", value: settings.baseUrl });

            return { requestHeaders: headers };
        }, { urls: ["<all_urls>"] }, ["requestHeaders", "blocking"]);
    }

    window.onload = () => {
        var settings: ISettings = {
            baseUrl: "https://www.facebook.com",
            refreshInterval: 20 * 1000
        };

        registerListeners(settings);

        var loader: Api.ILoader = new Loader(settings);
        loader.getStatusAsync().then(status => {
            loader.getNotificationsAsync(status.token).then(result => {
                console.log(result);
            });
        });
    };
}