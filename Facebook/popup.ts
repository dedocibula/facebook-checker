namespace Facebook.Frontend {
    interface IElements {
        openableLinks: string;
        navigationLinks: string;
        mainContainer: string;

        notificationsTemplate: string;
        messagesTemplate: string;
    }

    class Controller {
        private renderer: Renderer;
        private backendService: Api.IBackendService;

        private openableLinks: string;
        private navigationLinks: string;

        private $body: JQuery;

        constructor(elements: IElements, renderer: Renderer, backendService: Api.IBackendService) {
            this.renderer = renderer;
            this.backendService = backendService;

            this.openableLinks = elements.openableLinks;
            this.navigationLinks = elements.navigationLinks;

            this.$body = $("body");
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
    }

    class Renderer {
        private $mainContainer: JQuery;

        private notificationsTemplate: HandlebarsTemplateDelegate;
        private messagesTemplate: HandlebarsTemplateDelegate;

        constructor(elements: IElements) {
            this.$mainContainer = $(elements.mainContainer);

            this.initializeHandlebars(elements);
        }

        public renderNotifications(notifications: Entities.Notification[]): void {
            this.$mainContainer.html(this.notificationsTemplate(notifications));
        }

        public renderMessages(messages: Entities.Message[]): void {
            this.$mainContainer.html(this.messagesTemplate(messages));
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
            mainContainer: "#main-container",

            notificationsTemplate: "notifications",
            messagesTemplate: "messages"
        };

        const backendService: Api.IBackendService = new BackendProxy();
        const renderer: Renderer = new Renderer(elements);
        const controller: Controller = new Controller(elements, renderer, backendService);

        controller.registerGlobalListeners();
        backendService.fetchAll(response => {
            renderer.renderMessages(response.messages);
        });
    };
}