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
        private static get NOTIFICATION_URI(): string { return "/ajax/notifications/client/get.php"; }

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

    window.onload = () => {
        var settings: ISettings = {
            baseUrl: "https://www.facebook.com",
            refreshInterval: 20 * 1000
        };

        var loader: Api.ILoader = new Loader(settings);
        loader.getStatusAsync().then(status => {
            console.log(status);
        });
    };
}