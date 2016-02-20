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
        public type: ResponseType;
        public newNotifications: number;
        public newMessages: number;
        public notifications: Notification[];
        public messages: Message[];

        constructor(type: ResponseType, newNotifications?: number, newMessages?: number, notifications?: Notification[], messages?: Message[]) {
            this.type = type;
            this.newNotifications = newNotifications;
            this.newMessages = newMessages;
            this.notifications = notifications;
            this.messages = messages;
        }
    }

    export enum ResponseType {
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

    export const enum NotificationType {
        GroupActivity,
        BirthdayReminder,
        FeedComment,
        Like,
        LikeTagged,
        PageFanInvite,
        PhotoTag,
        Poke,
        MentionsComment,
        LoginAlert,
        PlanUserInvited,
        Wall,
        EventCommentMention,
        AdminPlanMallActivity,
        TaggedWithStory
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
        public text: string;
        public authors: Author[];
        public picture: string;
        public state: State;
        public timestamp: string;
        public url: string;

        constructor(id: string, text: string, authors: Author[], picture: string, state: State, timestamp: string, url: string) {
            this.id = id;
            this.text = text;
            this.authors = authors;
            this.picture = picture;
            this.state = state;
            this.timestamp = timestamp;
            this.url = url;
        }
    }

    export class Notification extends FacebookEntity {
        public type: NotificationType;
        public icon: string;
        public attachment: string;

        constructor(id: string, text: string, authors: Author[], picture: string, type: NotificationType, state: State, timestamp: string, url: string, icon: string, attachment?: string) {
            super(id, text, authors, picture, state, timestamp, url);
            this.type = type;
            this.icon = icon;
            this.attachment = attachment;
        }
    }

    export class Message extends FacebookEntity {
        public header: string;

        constructor(id: string, header: string, text: string, authors: Author[], picture: string, state: State, timestamp: string, url: string) {
            super(id, text, authors, picture, state, timestamp, url);
            this.header = header;
        }
    }
}