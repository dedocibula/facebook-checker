namespace Facebook.Frontend {
    interface ISettings {
        baseUrl: string;
        notificationsUri: string;
        messageBoxUri: string;

        openableLinks: string;
        navigationLinks: string;
        mainContainer: string;
        mainSection: string;
        loginSection: string;
        errorSection: string;
        errorMessage: string;
        authorizedSections: string,
        loaderImage: string;
        footerLink: string;

        notificationsTemplate: string;
        messagesTemplate: string;
    }

    class Controller {
        private renderer: Renderer;
        private backendService: Api.IBackendService;

        private openableLinks: string;
        private navigationLinks: string;

        private $body: JQuery;

        constructor(settings: ISettings, renderer: Renderer, backendService: Api.IBackendService) {
            this.renderer = renderer;
            this.backendService = backendService;

            this.openableLinks = settings.openableLinks;
            this.navigationLinks = settings.navigationLinks;

            this.$body = $("body");
        }

        public registerGlobalListeners(): void {
            const self = this;
            self.$body
                .off("click")
                .on("click", self.openableLinks, function (event) {
                    event.preventDefault();
                    const link: HTMLLinkElement = this as HTMLLinkElement;
                    self.backendService.openLink(link.href);
                })
                .on("click", self.navigationLinks, function (event) {
                    event.preventDefault();
                    const link: HTMLElement = this as HTMLElement;
                    self.renderer.makeSelected(link);
                    self.load(link.id);
                });
        }

        public load(entities: string = "notifications"): void {
            this.renderer.toggleLoading();
            this.backendService.fetchAll(response => {
                if (response.status === Entities.ResponseStatus.Ok) {
                    if (entities === "messages" || response.newMessages > 0)
                        this.renderer.renderMessages(response.messages);
                    else
                        this.renderer.renderNotifications(response.notifications);
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
    }

    class Renderer {
        private notificationsUrl: string;
        private messageBoxUrl: string;

        private $mainContainer: JQuery;
        private $mainSection: JQuery;
        private $loginSection: JQuery;
        private $errorSection: JQuery;
        private $errorMessage: JQuery;
        private $authorizedSections: JQuery;
        private $loaderImage: JQuery;
        private footerLink: HTMLLinkElement;

        private notificationsTemplate: HandlebarsTemplateDelegate;
        private messagesTemplate: HandlebarsTemplateDelegate;

        constructor(settings: ISettings) {
            this.notificationsUrl = settings.baseUrl + settings.notificationsUri;
            this.messageBoxUrl = settings.baseUrl + settings.messageBoxUri;

            this.$mainContainer = $(settings.mainContainer);
            this.$mainSection = $(settings.mainSection);
            this.$loginSection = $(settings.loginSection);
            this.$errorSection = $(settings.errorSection);
            this.$errorMessage = $(settings.errorMessage);
            this.$authorizedSections = $(settings.authorizedSections);
            this.$loaderImage = $(settings.loaderImage);
            this.footerLink = $(settings.footerLink)[0] as HTMLLinkElement;

            this.initializeHandlebars(settings);
        }

        public renderNotifications(notifications: Entities.Notification[]): void {
            this.$mainSection.html(this.notificationsTemplate(notifications));
            this.footerLink.href = this.notificationsUrl;
        }

        public renderMessages(messages: Entities.Message[]): void {
            this.$mainSection.html(this.messagesTemplate(messages));
            this.footerLink.href = this.messageBoxUrl;
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

        public makeSelected(element: HTMLElement): void {
            const $element: JQuery = $(element);
            if (!$element.hasClass("selected"))
                $element.addClass("selected").siblings().removeClass("selected");
        }

        private initializeHandlebars(elements: ISettings): void {
            // templates
            this.notificationsTemplate = Handlebars.templates[elements.notificationsTemplate];
            this.messagesTemplate = Handlebars.templates[elements.messagesTemplate];

            // helpers
            Handlebars.registerHelper("checkNew", (state: Entities.State) => {
                return state !== Entities.State.Read ? "new-list-item" : "";
            });

            Handlebars.registerHelper("getName", (authors: Entities.Author[]) => {
                return authors.map(author => author.fullName).join(", ");
            });

            Handlebars.registerHelper("emphasize", (notification: Entities.Notification) => {
                let text: string = "", current: number = 0;
                const original: string = notification.text, emphases: Entities.Range[] = notification.emphases;
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
                return text;
            });
        }
    }

    class BackendProxy implements Api.IBackendService {
        public fetchAll(onReady?: (response: Entities.Response) => void): void {
            this.internalRequest("fetchAll", null, onReady);
        }

        public openLink(url: string): void {
            this.internalRequest("openLink", [url]);
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

            openableLinks: "a.openable",
            navigationLinks: "nav li",
            mainContainer: "#main",
            mainSection: "#main-section",
            loginSection: "#login-section",
            errorSection: "#error-section",
            errorMessage: "#error",
            authorizedSections: ".authorized",
            loaderImage: "#loader",
            footerLink: "#footer",

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