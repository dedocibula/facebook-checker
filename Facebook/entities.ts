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
        public name: string;
        public profilePicture: string;

        constructor(name: string, profilePicture: string) {
            this.name = name;
            this.profilePicture = profilePicture;
        }
    }

    export class Notification {
        public id: string;
        public text: string;
        public authors: Author[];
        public type: Type;
        public timestamp: string;
        public url: string;
        public icon: string;
        public attachment: string;

        constructor(id: string, text: string, authors: Author[], type: Type, timestamp: string, url: string, icon: string, attachment?: string) {
            this.id = id;
            this.text = text;
            this.authors = authors;
            this.type = type;
            this.timestamp = timestamp;
            this.url = url;
            this.icon = icon;
            this.attachment = attachment;
        }
    }

    export class Message {

    }
}