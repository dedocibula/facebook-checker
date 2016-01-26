module Facebook.Entities {
    export class Status {
        public token: string;
        public notificationCount: number;
        public messageCount: number;

        constructor(token: string, notificationCount: number, messageCount: number) {
            this.token = token;
            this.notificationCount = notificationCount;
            this.messageCount = messageCount;
        }
    }

    export const enum State {
        Unseen,
        Unread,
        Read,
    }

    export const enum Type {
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

    class FacebookEntity {
        public id: string;
        public text: string;
        public authors: Author[];
        public state: State;
        public timestamp: string;
        public url: string;

        constructor(id: string, text: string, authors: Author[], state: State, timestamp: string, url: string) {
            this.id = id;
            this.text = text;
            this.authors = authors;
            this.state = state;
            this.timestamp = timestamp;
            this.url = url;
        }
    }

    export class Notification extends FacebookEntity {
        public type: Type;
        public icon: string;
        public attachment: string;

        constructor(id: string, text: string, authors: Author[], type: Type, state: State, timestamp: string, url: string, icon: string, attachment?: string) {
            super(id, text, authors, state, timestamp, url);
            this.type = type;
            this.icon = icon;
            this.attachment = attachment;
        }
    }

    export class Message extends FacebookEntity {
        public header: string;

        constructor(id: string, header: string, text: string, authors: Author[], state: State, timestamp: string, url: string) {
            super(id, text, authors, state, timestamp, url);
            this.header = header;
        }
    }
}