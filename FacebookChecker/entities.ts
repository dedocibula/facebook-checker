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
        public notifications: Notification[];
        public messages: Message[];

        constructor(type: ResponseStatus, newNotifications?: number, newMessages?: number, notifications?: Notification[], messages?: Message[]) {
            this.status = type;
            this.newNotifications = newNotifications;
            this.newMessages = newMessages;
            this.notifications = notifications;
            this.messages = messages;
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
        Messages
    }

    export class Range {
        public from: number;
        public to: number;

        constructor(from: number, to: number) {
            this.from = from;
            this.to = to;
        }
    }

    export class Pair<T1, T2> {
        public first: T1;
        public second: T2;

        constructor(first: T1, second: T2) {
            this.first = first;
            this.second = second;
        }
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

    export abstract class FacebookEntity {
        public id: string;
        public type: EntityType;
        public text: string;
        public authors: Author[];
        public picture: string;
        public state: State;
        public alertId: string;
        public timestamp: string;
        public url: string;

        constructor(id: string, type: EntityType, text: string, authors: Author[], picture: string, state: State, alertId: string, timestamp: string, url: string) {
            this.id = id;
            this.type = type;
            this.text = text;
            this.authors = authors;
            this.picture = picture;
            this.state = state;
            this.alertId = alertId;
            this.timestamp = timestamp;
            this.url = url;
        }
    }

    export class Notification extends FacebookEntity {
        public emphases: Range[];
        public icon: string;
        public attachment: string;

        constructor(id: string, text: string, emphases: Range[], authors: Author[], picture: string, state: State, alertId: string, timestamp: string, url: string, icon: string, attachment?: string) {
            super(id, EntityType.Notifications, text, authors, picture, state, alertId, timestamp, url);
            this.emphases = emphases;
            this.icon = icon;
            this.attachment = attachment;
        }
    }

    export class Message extends FacebookEntity {
        public header: string;
        public repliedLast: boolean;
        public seenByAll: boolean;

        constructor(id: string, header: string, text: string, authors: Author[], picture: string, state: State, alertId: string, timestamp: string, url: string, repliedLast: boolean, seenByAll: boolean) {
            super(id, EntityType.Messages, text, authors, picture, state, alertId, timestamp, url);
            this.header = header;
            this.repliedLast = repliedLast;
            this.seenByAll = seenByAll;
        }
    }
}