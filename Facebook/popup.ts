namespace Facebook.Frontend {
    class Controller {
        
    }

    class Renderer {
        
    }

    class BackendProxy implements Api.IBackendService {
        fetchAll(onReady?: (response: Entities.Response) => void): void {
            this.internalRequest("fetchAll", null, onReady);
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

    const backendService: Api.IBackendService = new BackendProxy();
}