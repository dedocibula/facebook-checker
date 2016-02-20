namespace Facebook.Frontend {
    interface IElements {
        openableLinks: string;
        navigationLinks: string;
        mainContainer: string;
        mainSection: string;
        loaderImage: string;

        notificationsTemplate: string;
        messagesTemplate: string;
    }

    class Controller {
        private renderer: Renderer;
        private backendService: Api.IBackendService;

        private openableLinks: string;
        private navigationLinks: string;

        private $body: JQuery;
        private $mainContainer: JQuery;

        constructor(elements: IElements, renderer: Renderer, backendService: Api.IBackendService) {
            this.renderer = renderer;
            this.backendService = backendService;

            this.openableLinks = elements.openableLinks;
            this.navigationLinks = elements.navigationLinks;

            this.$body = $("body");
            this.$mainContainer = $(elements.mainContainer);
        }

        public registerGlobalListeners(): void {
            const self = this;
            self.$body
                .off("click")
                .on("click", self.openableLinks, function (event) {
                    event.preventDefault();
                    const link = (this as HTMLLinkElement);
                    self.backendService.openLink(link.href);
                })
                .on("click", self.navigationLinks, function (event) {
                    event.preventDefault();
                    const $link = $(this);
                    if (!$link.hasClass("selected"))
                        $link.addClass("selected").siblings(self.navigationLinks).removeClass("selected");
                });
        }

        public invalidateAll(): void {
            this.$mainContainer.css("pointer-events", "none");
            this.renderer.toggleLoading();
            this.backendService.fetchAll(response => {
                if (response.status === Entities.ResponseStatus.Ok) {
                    if (response.newMessages > 0)
                        this.renderer.renderMessages(response.messages);
                    else
                        this.renderer.renderNotifications(response.notifications);
                    this.$mainContainer.css("pointer-events", "all");
                    this.renderer.toggleLoading();
                    this.$mainContainer.css("visibility", "visible");
                }
            });
        }
    }

    class Renderer {
        private $mainContainer: JQuery;
        private $mainSection: JQuery;
        private $loaderImage: JQuery;

        private notificationsTemplate: HandlebarsTemplateDelegate;
        private messagesTemplate: HandlebarsTemplateDelegate;

        constructor(elements: IElements) {
            this.$mainContainer = $(elements.mainContainer);
            this.$mainSection = $(elements.mainSection);
            this.$loaderImage = $(elements.loaderImage);

            this.initializeHandlebars(elements);
        }

        public renderNotifications(notifications: Entities.Notification[]): void {
            this.$mainSection.html(this.notificationsTemplate(notifications));
        }

        public renderMessages(messages: Entities.Message[]): void {
            this.$mainSection.html(this.messagesTemplate(messages));
        }

        public toggleLoading(): void {
            this.$loaderImage.css("top", (this.$mainContainer.height() / 2 - 20) + "px");
            this.$loaderImage.toggle();
            this.$mainContainer.toggleClass("loading");
        }

        private initializeHandlebars(elements: IElements): void {
            // templates
            this.notificationsTemplate = Handlebars.templates[elements.notificationsTemplate];
            this.messagesTemplate = Handlebars.templates[elements.messagesTemplate];

            // helpers
            Handlebars.registerHelper("checkNew", (state: Entities.State) => {
                return state !== Entities.State.Read ? "new-list-item" : "";
            });

            Handlebars.registerHelper("getName", (authors: Entities.Author[]) => {
                return authors[0].fullName;
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
        const elements: IElements = {
            openableLinks: "a.openable",
            navigationLinks: "nav li",
            mainContainer: "#main",
            mainSection: "#main-section",
            loaderImage: "#loader",

            notificationsTemplate: "notifications",
            messagesTemplate: "messages"
        };

        const backendService: Api.IBackendService = new BackendProxy();
        const renderer: Renderer = new Renderer(elements);
        const controller: Controller = new Controller(elements, renderer, backendService);

        controller.registerGlobalListeners();
        controller.invalidateAll();
    };
}