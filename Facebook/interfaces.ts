module Facebook.Api {
    export interface ILoader {
        getStatusAsync(): Promise<Entities.Status>;

        getNotificationsAsync(token: string): Promise<Entities.Notification[]>;

        getMessagesAsync(token: string): Promise<Entities.Message[]>;

        getExternalResourceAsync(url: string): Promise<string>;
    }
}