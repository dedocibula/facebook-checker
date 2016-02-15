namespace Facebook.Frontend {
    interface IElements {
        openableLinks: string;
        navigationLinks: string;
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

        public registerGlobalListeners() {
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
            navigationLinks: "nav li"
        };

        const backendService: Api.IBackendService = new BackendProxy();
        const renderer: Renderer = new Renderer();
        const controller: Controller = new Controller(elements, renderer, backendService);

        controller.registerGlobalListeners();
    };
}