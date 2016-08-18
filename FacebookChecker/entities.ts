namespace Facebook.Entities {
    export class Request {
        public action: string;
        public parameters: any[];

        constructor(action: string, parameters?: any[]) {
            this.action = action;
            this.parameters = parameters;
        }
    }

    export class Response {
        public status: ResponseStatus;
        public newNotifications: number;
        public newMessages: number;
        public newFriendRequests: number;
        public notifications: Notification[];
        public messages: Message[];
        public friendRequests: FriendRequest[];

        constructor(type: ResponseStatus, newNotifications?: number, newMessages?: number, newFriendRequests?: number, notifications?: Notification[], messages?: Message[], friendRequests?: FriendRequest[]) {
            this.status = type;
            this.newNotifications = newNotifications;
            this.newMessages = newMessages;
            this.newFriendRequests = newFriendRequests;
            this.notifications = notifications;
            this.messages = messages;
            this.friendRequests = friendRequests;
        }
    }

    export enum ResponseStatus {
        Ok,
        ConnectionRejected,
        Unauthorized,
        IllegalToken
    }

    export class FacebookInfo {
        public token: string;
        public profileUrl: string;

        constructor(token: string, profileUrl: string) {
            this.token = token;
            this.profileUrl = profileUrl;
        }
    }

    export const enum State {
        Unseen,
        Unread,
        Read
    }

    export enum EntityType {
        Notifications,
        Messages,
        FriendRequests
    }

    export class ReadInfo {
        public entityType: EntityType;
        public state: State;
        public alertId: string;

        constructor(entityType: EntityType, state: State, alertId: string) {
            this.entityType = entityType;
            this.state = state;
            this.alertId = alertId;
        }
    }

    export class FriendInfo {
        public requestId: string;
        public accept: boolean;

        constructor(requestId: string, accept: boolean) {
            this.requestId = requestId;
            this.accept = accept;
        }
    }

    export class Author {
        public fullName: string;
        public profilePicture: string;
        public shortName: string;

        constructor(fullName: string, profilePicture: string, shortName?: string) {
            this.fullName = fullName;
            this.profilePicture = profilePicture;
            this.shortName = shortName;
        }
    }

    export abstract class FacebookEntity implements Api.INotifiable {
        public id: string;
        public type: EntityType;
        public text: string;
        public state: State;
        public url: string;
        public picture: string;

        constructor(id: string, type: EntityType, text: string, state: State, url: string, picture: string) {
            this.id = id;
            this.type = type;
            this.text = text;
            this.state = state;
            this.url = url;
            this.picture = picture;
        }

        public abstract getId(): string;

        public abstract getTitle(): string;

        public getText(): string { return this.text; }

        public getUrl(): string { return this.url; }
    }

    export abstract class InformativeEntity extends FacebookEntity {
        public authors: Author[];
        public timestamp: string;
        public alertId: string;

        constructor(id: string, authors: Author[], type: EntityType, text: string, state: State, url: string, picture: string, timestamp: string, alertId: string) {
            super(id, type, text, state, url, picture);
            this.authors = authors;
            this.timestamp = timestamp;
            this.alertId = alertId;
        }
    }

    export class Notification extends InformativeEntity {
        public emphases: Extensions.Range[];
        public icon: string;
        public attachment: string;

        constructor(id: string, text: string, emphases: Extensions.Range[], authors: Author[], picture: string, state: State, alertId: string, timestamp: string, url: string, icon: string, attachment?: string) {
            super(id, authors, EntityType.Notifications, text, state, url, picture, timestamp, alertId);
            this.emphases = emphases;
            this.icon = icon;
            this.attachment = attachment;
        }

        public getId(): string { return `notif_${this.id}`; }

        public getTitle(): string { return "New Notification"; }
    }

    export class Message extends InformativeEntity {
        public header: string;
        public repliedLast: boolean;
        public seenByAll: boolean;
        public emoticons: Extensions.Pair<Extensions.Range, string>[];

        constructor(id: string, header: string, text: string, authors: Author[], picture: string, state: State, alertId: string, timestamp: string, url: string, repliedLast: boolean, seenByAll: boolean, emoticons: Extensions.Pair<Extensions.Range, string>[]) {
            super(id, authors, EntityType.Messages, text, state, url, picture, timestamp, alertId);
            this.header = header;
            this.repliedLast = repliedLast;
            this.seenByAll = seenByAll;
            this.emoticons = emoticons;
        }

        public getId(): string { return `mes_${this.id}`; }

        public getTitle(): string { return this.header; }
    }

    export class FriendRequest extends FacebookEntity {
        public requestor: Author;
        public mutualFriendText: string;
        public mutualFriendTooltip: string;

        constructor(id: string, text: string, requestor: Author, picture: string, state: State, url: string, mutualFriendText?: string, mutualFriendTooltip?: string) {
            super(id, EntityType.FriendRequests, text, state, url, picture);
            this.requestor = requestor;
            this.mutualFriendText = mutualFriendText;
            this.mutualFriendTooltip = mutualFriendTooltip;
        }

        public getId(): string { return `fr_${this.id}`; }

        public getTitle(): string { return "New Friend Request"; }
    }
}