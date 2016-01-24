module Facebook.Api {
    export interface ILoader {
        getNotificationsAsync(): Promise<Entities.Notification[]>;

        getMessagesAsync(): Promise<Entities.Message[]>;
    }
}