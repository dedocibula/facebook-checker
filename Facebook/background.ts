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
                    resolve(this.parseStatus(result));
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
                    data: `__a=1&fb_dtsg=${token}`
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
            return null;
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