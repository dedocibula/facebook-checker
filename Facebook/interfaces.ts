namespace Facebook.Api {
    export interface ILoader {
        getInfoAsync(): Promise<Entities.FacebookInfo>;

        getNotificationsAsync(token: string): Promise<Entities.Notification[]>;

        getMessagesAsync(token: string, profileUrl: string): Promise<Entities.Message[]>;

        getExternalResourceAsync(url: string): Promise<string>;
    }

    export interface IBackendService {
        fetchAll(onReady?: (response: Entities.Response) => void): void;

        openLink(url: string): void;
    }
}