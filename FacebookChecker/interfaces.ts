namespace Facebook.Api {
    export interface ILoader {
        getInfoAsync(): Promise<Entities.FacebookInfo>;

        getNotificationsAsync(token: string): Promise<Entities.Notification[]>;

        getMessagesAsync(token: string, profileUrl: string): Promise<Entities.Message[]>;

        getMessageRequestsAsync(token: string, profileUrl: string): Promise<Entities.Message[]>;

        getFriendRequestsAsync(token: string): Promise<Entities.FriendRequest[]>;

        getExternalResourceAsync(url: string): Promise<string>;

        markNotificationRead(token: string, id: string): Promise<void>;

        markMessageRead(token: string, id: string): Promise<void>;

        resolveFriendRequest(token: string, id: string, accept: boolean): Promise<void>;
    }

    export interface IBackendService {
        fetchAll(onReady?: (response: Entities.Response) => void): void;

        openLink(url: string): void;

        markRead(readInfo: Entities.ReadInfo, onReady?: (response: Entities.Response) => void): void;

        resolveFriendRequest(friendInfo: Entities.FriendInfo, onReady?: (response: Entities.Response) => void): void;

        toggleDoNotDisturb(on: boolean, onReady? : (response: Entities.Response) => void): void;
    }

    export interface INotifiable {
        getId(): string;

        getTitle(): string;

        getText(): string;

        getUrl(): string;

        picture: string;
    }
}