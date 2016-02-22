namespace Facebook.Api {
    export interface ILoader {
        getInfoAsync(): Promise<Entities.FacebookInfo>;

        getNotificationsAsync(token: string): Promise<Entities.Notification[]>;

        getMessagesAsync(token: string, profileUrl: string): Promise<Entities.Message[]>;

        getExternalResourceAsync(url: string): Promise<string>;

        markNotificationRead(token: string, id: string): Promise<void>;

        markMessageRead(token: string, id: string): Promise<void>;
    }

    export interface IBackendService {
        fetchAll(onReady?: (response: Entities.Response) => void): void;

        openLink(url: string): void;

        markRead(readInfo: Entities.ReadInfo, onReady?: (response: Entities.Response) => void): void;
    }
}