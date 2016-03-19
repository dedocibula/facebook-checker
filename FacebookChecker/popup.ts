namespace Facebook.Frontend {
    interface ISettings {
        baseUrl: string;
        notificationsUri: string;
        messageBoxUri: string;
        preferences: Entities.EntityType[];
        defaultType: Entities.EntityType;

        openableLinks: string;
        navigationLinks: string;
        readButtons: string;
        navigationMappings: { [type: string]: string };
        mainContainer: string;
        mainSection: string;
        loginSection: string;
        errorSection: string;
        errorMessage: string;
        authorizedSections: string,
        loaderImage: string;
        footerLink: string;
        mainListItems: string;
        pictureSize: number;

        notificationsTemplate: string;
        messagesTemplate: string;
    }

    class Controller {
        private renderer: Renderer;
        private backendService: Api.IBackendService;

        private preferences: Entities.EntityType[];
        private defaultType: Entities.EntityType;

        private openableLinks: string;
        private navigationLinks: string;
        private readButtons: string;
        private mainListItems: string;

        private $body: JQuery;

        constructor(settings: ISettings, renderer: Renderer, backendService: Api.IBackendService) {
            this.renderer = renderer;
            this.backendService = backendService;

            this.preferences = settings.preferences;
            this.defaultType = settings.defaultType;

            this.openableLinks = settings.openableLinks;
            this.navigationLinks = settings.navigationLinks;
            this.readButtons = settings.readButtons;
            this.mainListItems = settings.mainListItems;

            this.$body = $("body");
        }

        public registerGlobalListeners(): void {
            const self = this;
            self.$body
                .off("click")
                .on("click", self.readButtons, function(event) {
                    event.stopPropagation();
                    const button: HTMLElement = this as HTMLElement;
                    const readInfo: Entities.ReadInfo = JSON.parse(button.dataset["readInfo"]) as Entities.ReadInfo;
                    if (readInfo.state === Entities.State.Read)
                        return;
                    self.backendService.markRead(readInfo, (response: Entities.Response) => {
                        if (response.status === Entities.ResponseStatus.Ok)
                            self.renderer.updateUnreadState(readInfo.entityType, button);
                    });
                })
                .on("click", self.openableLinks, function(event) {
                    event.preventDefault();
                    const link: HTMLLinkElement = this as HTMLLinkElement;
                    self.backendService.openLink(link.href);
                })
                .on("click", self.navigationLinks, function(event) {
                    event.preventDefault();
                    const link: HTMLElement = this as HTMLElement;
                    self.load(Entities.EntityType[(link.id.charAt(0).toUpperCase() + link.id.slice(1))]);
                })
                .off("mouseover mouseout")
                .on("mouseover mouseout", self.mainListItems, function() {
                    const $button: JQuery = $(this).find(self.readButtons);
                    if (event.type === "mouseover")
                        $button.show();
                    else
                        $button.hide();
                });
        }

        public load(entityType?: Entities.EntityType): void {
            this.renderer.toggleLoading();
            this.backendService.fetchAll(response => {
                if (response.status === Entities.ResponseStatus.Ok) {
                    if (typeof entityType === "number")
                        this.renderByType(entityType, response);
                    else
                        this.renderByPreferences(response);
                    this.updateHeaders(response);
                    this.renderer.displayMain();
                } else if (response.status === Entities.ResponseStatus.Unauthorized) {
                    this.renderer.displayUnauthorized();
                } else if (response.status === Entities.ResponseStatus.IllegalToken) {
                    this.renderer.displayError("Something went wrong! Try closing an opening extension window.");
                } else if (response.status === Entities.ResponseStatus.ConnectionRejected) {
                    this.renderer.displayError("We couldn't establish connection to Facebook! Make sure you have access to the Internet.");
                }
                this.renderer.toggleLoading(true);
            });
        }

        private renderByType(entityType: Entities.EntityType, response: Entities.Response): void {
            if (entityType === Entities.EntityType.Notifications)
                this.renderer.renderNotifications(response.notifications);
            else if (entityType === Entities.EntityType.Messages)
                this.renderer.renderMessages(response.messages);
            else
                throw new Error("Unrecognized type");
        }

        private renderByPreferences(response: Entities.Response): void {
            for (let entityType of this.preferences) {
                if (entityType === Entities.EntityType.Notifications && response.newNotifications > 0) {
                    this.renderer.renderNotifications(response.notifications);
                    return;
                } else if (entityType === Entities.EntityType.Messages && response.newMessages > 0) {
                    this.renderer.renderMessages(response.messages);
                    return;
                }
            }
            this.renderByType(this.defaultType, response);
        }

        private updateHeaders(response: Entities.Response): void {
            this.renderer.updateUnreadCounts(
                new Extensions.Pair(Entities.EntityType[Entities.EntityType.Notifications], response.newNotifications),
                new Extensions.Pair(Entities.EntityType[Entities.EntityType.Messages], response.newMessages)
            );
        }
    }

    class Renderer {
        private notificationsUrl: string;
        private messageBoxUrl: string;
        private pictureSize: number;

        private $mainContainer: JQuery;
        private $mainSection: JQuery;
        private $loginSection: JQuery;
        private $errorSection: JQuery;
        private $errorMessage: JQuery;
        private $authorizedSections: JQuery;
        private $loaderImage: JQuery;
        private $navigationMappings: { [type: string]: JQuery };
        private footerLink: HTMLLinkElement;

        private notificationsTemplate: HandlebarsTemplateDelegate;
        private messagesTemplate: HandlebarsTemplateDelegate;

        constructor(settings: ISettings) {
            this.notificationsUrl = settings.baseUrl + settings.notificationsUri;
            this.messageBoxUrl = settings.baseUrl + settings.messageBoxUri;
            this.pictureSize = settings.pictureSize;

            this.$mainContainer = $(settings.mainContainer);
            this.$mainSection = $(settings.mainSection);
            this.$loginSection = $(settings.loginSection);
            this.$errorSection = $(settings.errorSection);
            this.$errorMessage = $(settings.errorMessage);
            this.$authorizedSections = $(settings.authorizedSections);
            this.$loaderImage = $(settings.loaderImage);
            this.footerLink = $(settings.footerLink)[0] as HTMLLinkElement;

            this.navigationMappings = settings.navigationMappings;
            this.initializeHandlebars(settings);
        }

        public renderNotifications(notifications: Entities.Notification[]): void {
            this.$mainSection.html(this.notificationsTemplate(notifications));
            this.footerLink.href = this.notificationsUrl;
            this.makeSelected(Entities.EntityType.Notifications);
        }

        public renderMessages(messages: Entities.Message[]): void {
            this.$mainSection.html(this.messagesTemplate(messages));
            this.footerLink.href = this.messageBoxUrl;
            this.makeSelected(Entities.EntityType.Messages);
        }

        public updateUnreadState(entityType: Entities.EntityType, button: HTMLElement): void {
            $(button).closest("a").removeClass("new-list-item");
            const entityString: string = Entities.EntityType[entityType];
            this.updateUnreadCounts(new Extensions.Pair(entityString, this.$navigationMappings[entityString].data("unread") as number - 1));
        }

        public updateUnreadCounts(...counts: Extensions.Pair<string, number>[]): void {
            for (let pair of counts) {
                const $link: JQuery = this.$navigationMappings[pair.first].find("a");
                const original = $link.html().split(" (")[0];
                $link.html(original + (pair.second === 0 ? "" : ` (${pair.second})`)).parent().data("unread", pair.second);
            }
        }

        public toggleLoading(showContainer: boolean = false): void {
            this.$loaderImage.css("top", (this.$mainContainer.height() / 2 - 25) + "px").toggle();
            this.$mainContainer.css("pointer-events", this.$mainContainer.css("pointer-events") === "none" ? "all" : "none").toggleClass("loading");
            if (showContainer)
                this.$mainContainer.css("visibility", "visible");
        }

        public displayMain(): void {
            this.$authorizedSections.show();
            this.$errorSection.hide();
            this.$loginSection.hide();
            this.$mainSection.show();
        }

        public displayUnauthorized(): void {
            this.$authorizedSections.hide();
            this.$errorSection.hide();
            this.$mainSection.hide();
            this.$loginSection.show();
        }

        public displayError(error: string): void {
            this.$authorizedSections.hide();
            this.$loginSection.hide();
            this.$mainSection.hide();
            this.$errorMessage.text(error);
            this.$errorSection.show();
        }

        private initializeHandlebars(elements: ISettings): void {
            // templates
            this.notificationsTemplate = Handlebars.templates[elements.notificationsTemplate];
            this.messagesTemplate = Handlebars.templates[elements.messagesTemplate];

            // helpers
            Handlebars.registerHelper("checkNew", (state: Entities.State) => {
                return state !== Entities.State.Read ? "new-list-item" : "";
            });

            Handlebars.registerHelper("emphasize", (notification: Entities.Notification) => {
                let text: string = "", current: number = 0;
                const original: string = notification.text, emphases: Extensions.Range[] = notification.emphases;
                for (let i = 0; i < original.length; i++) {
                    if (current < emphases.length) {
                        if (i === emphases[current].from) {
                            text += "<span class='emphasize'>";
                        } else if (i === emphases[current].to) {
                            text += "</span>";
                            current++;
                        }
                    }
                    text += original[i];
                }
                return new Handlebars.SafeString(text);
            });

            Handlebars.registerHelper("serializeReadInfo", (entity: Entities.FacebookEntity) => {
                return JSON.stringify(new Entities.ReadInfo(entity.type, entity.state, entity.alertId));
            });

            Handlebars.registerHelper("emojify", (message: Entities.Message) => {
                let text: string = "", current: number = 0;
                const original: string = message.text, emoticons: Extensions.Pair<Extensions.Range, string>[] = message.emoticons;
                for (let i = 0; i < original.length; i++) {
                    if (current < emoticons.length && i === emoticons[current].first.from) {
                        const emoji: string = original.substring(emoticons[current].first.from, emoticons[current].first.to);
                        text += `<span title="${emoji}" class="emoji ${emoticons[current].second}"></span>`;
                        i = emoticons[current].first.to - 1;
                        current++;
                    } else {
                        text += Handlebars.Utils.escapeExpression(original[i]);
                    }
                }
                return new Handlebars.SafeString(text);
            });

            Handlebars.registerHelper("displayStatus", (message: Entities.Message) => {
                return !message.repliedLast ? "" : (message.seenByAll ? "seenByAll" : "repliedLast");
            });

            Handlebars.registerHelper("renderPicture", (authors: Entities.Author[]) => {
                const count = Math.min(authors.length, 3);
                let text: string = "";
                for (let i = 1; i <= count; i++) {
                    const author: Entities.Author = authors[i - 1];
                    const side: number = this.pictureSize / Math.pow(2, i < count ? i - 1 : Math.max(0, i - 2));
                    const width: number = Math.round(side / count) * Math.max(1, count - 1);
                    const margin: number = Math.round((width - side) / 2);
                    text += `<div title="${author.shortName}" class="picture${i}" style="width: ${width}px;">\n`;
                    text += `<img src="${author.profilePicture}" alt="${author.fullName}" height="${side}px" width="${side}px" style="margin-left: ${margin}px;" />\n`;
                    text += `</div>\n`;
                }
                return new Handlebars.SafeString(text);
            });
        }

        private makeSelected(type: Entities.EntityType): void {
            const $element: JQuery = this.$navigationMappings[Entities.EntityType[type]];
            if (!$element.hasClass("selected"))
                $element.addClass("selected").siblings().removeClass("selected");
        }

        private set navigationMappings(navigationMappings: { [type: string]: string }) {
            this.$navigationMappings = {};
            for (let type in navigationMappings)
                if (navigationMappings.hasOwnProperty(type))
                    this.$navigationMappings[type] = $(navigationMappings[type]);
        }
    }

    class BackendProxy implements Api.IBackendService {
        public fetchAll(onReady?: (response: Entities.Response) => void): void {
            this.internalRequest("fetchAll", null, onReady);
        }

        public openLink(url: string): void {
            this.internalRequest("openLink", [url]);
        }

        public markRead(readInfo: Entities.ReadInfo, onReady?: (response: Entities.Response) => void): void {
            this.internalRequest("markRead", [readInfo], onReady);
        }

        private internalRequest(action: string, parameters?: any[], onReady?: (response: Entities.Response) => void): void {
            if (chrome && chrome.runtime) {
                chrome.runtime.sendMessage(new Entities.Request(action, parameters), (response: Entities.Response) => {
                    if (typeof onReady === "function")
                        onReady(response);
                });
            }
        }
    }

    window.onload = () => {
        const settings: ISettings = {
            baseUrl: "https://www.facebook.com",
            notificationsUri: "/notifications",
            messageBoxUri: "/messages",
            preferences: [Entities.EntityType.Messages, Entities.EntityType.Notifications],
            defaultType: Entities.EntityType.Notifications,

            openableLinks: "a.openable",
            navigationLinks: "nav li",
            readButtons: ".read-button",
            navigationMappings: {
                Notifications: "#notifications",
                Messages: "#messages"
            },
            mainContainer: "#main",
            mainSection: "#main-section",
            loginSection: "#login-section",
            errorSection: "#error-section",
            errorMessage: "#error",
            authorizedSections: ".authorized",
            loaderImage: "#loader",
            footerLink: "#footer",
            mainListItems: "#main-section .list-group-item",
            pictureSize: 50,

            notificationsTemplate: "notifications",
            messagesTemplate: "messages"
        };

        const backendService: Api.IBackendService = new BackendProxy();
        const renderer: Renderer = new Renderer(settings);
        const controller: Controller = new Controller(settings, renderer, backendService);

        controller.registerGlobalListeners();
        controller.load();
    };
}