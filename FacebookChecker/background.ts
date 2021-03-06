﻿namespace Facebook.Backend {
    interface ISettings {
        baseUrl: string;
        uriSuffix: string;
        refreshInterval: number;
        backoffCounts: Extensions.Pair<Entities.EntityType, number>[];
        fetchLimit: number;
        notificationFadeoutDelay: number;
        messagePrefix: string;
        sound: string;
        contextMessage: string;
        notificationIcon: string;
        onlineIcon: string;
        offlineIcon: string;
        badgeAlertColor: number[];
        badgeNormalColor: number[],
    }

    class BackgroundWorker implements Api.IBackendService {
        private settings: ISettings;
        private loader: Api.ILoader;
        private chrome: ChromeService;
        private timer: number;
        private isOnline: boolean;
        private sound: HTMLAudioElement;
        private dndEnabled: boolean;

        private info: Entities.FacebookInfo;
        private unread: { [key: string]: string };
        private loadCache: Extensions.CountDownCache<Entities.EntityType, Entities.FacebookEntity[]>;
        private emptyCallback: (response: Entities.Response) => void;

        constructor(settings: ISettings, loader: Api.ILoader, chrome: ChromeService) {
            this.settings = settings;
            this.loader = loader;
            this.chrome = chrome;
            this.timer = null;
            this.isOnline = false;
            this.dndEnabled = false;

            this.unread = {};
            this.loadCache = new Extensions.CountDownCache<Entities.EntityType, Entities.FacebookEntity[]>(this.expandCounters(this.settings.backoffCounts));
            this.emptyCallback = () => { };
        }

        public start(onFirst?: (response: Entities.Response) => void): void {
            if (this.timer)
                return;
            onFirst = typeof onFirst === "function" ? onFirst : this.emptyCallback;
            this.reloadAll().then(response => {
                onFirst(response);
                this.processResponse(response);
            });
            this.timer = setInterval(() => {
                if (!this.dndEnabled)
                    this.reloadAll().then(response => this.processResponse(response));
            }, this.settings.refreshInterval);
        }

        public fetchAll(onReady?: (response: Entities.Response) => void): void {
            this.stop();
            this.loadCache.invalidate();
            this.start(typeof onReady === "function" ? onReady : null);
        }

        public openLink(url: string): void {
            if (typeof url === "string")
                this.chrome.createOrUpdateTab(url);
        }

        public markRead(readInfo: Entities.ReadInfo, onReady?: (response: Entities.Response) => void): void {
            if (readInfo.state === Entities.State.Read)
                return;
            onReady = typeof onReady === "function" ? onReady : this.emptyCallback;
            this.try(readInfo.entityType === Entities.EntityType.Messages ?
                (info: Entities.FacebookInfo) => this.loader.markMessageRead(info.token, readInfo.alertId) :
                (info: Entities.FacebookInfo) => this.loader.markNotificationRead(info.token, readInfo.alertId),
                () => new Entities.Response(Entities.ResponseStatus.Ok)).then(response => {
                    onReady(response);
                    if (response.status === Entities.ResponseStatus.Ok) {
                        this.loadCache.invalidate();
                        this.reloadAll().then(secondResponse => this.processResponse(secondResponse));
                    }
                });
        }

        public resolveFriendRequest(friendInfo: Entities.FriendInfo, onReady?: (response: Entities.Response) => void): void {
            onReady = typeof onReady === "function" ? onReady : this.emptyCallback;
            this.try((info: Entities.FacebookInfo) => this.loader.resolveFriendRequest(info.token, friendInfo.requestId, friendInfo.accept),
                () => new Entities.Response(Entities.ResponseStatus.Ok)).then(response => {
                    if (response.status === Entities.ResponseStatus.Ok) {
                        this.loadCache.invalidate();
                        this.reloadAll().then(secondResponse => {
                            onReady(secondResponse);
                            this.processResponse(secondResponse);
                        });
                    }
                });
        }

        public toggleDoNotDisturb(on: boolean, onReady?: (response: Entities.Response) => void): void {
            onReady = typeof onReady === "function" ? onReady : this.emptyCallback;
            this.dndEnabled = on;
            this.chrome.updateBadge(on ? "DND" : "");
            if (on) {
                onReady(new Entities.Response(Entities.ResponseStatus.DoNotDisturb));
            } else {
                this.loadCache.invalidate();
                this.reloadAll().then(response => {
                    onReady(response);
                    this.processResponse(response);
                });
            }
        }

        public stop(): void {
            if (!this.timer)
                return;
            clearInterval(this.timer);
            this.timer = null;
        }

        private reloadAll(): Promise<Entities.Response> {
            return this.try((info: Entities.FacebookInfo) => Promise.all<Entities.FacebookEntity[]>([
                this.expiringLoad(Entities.EntityType.Notifications, () => this.loader.getNotificationsAsync(info.token)),
                this.expiringLoad(Entities.EntityType.Messages, () => this.loader.getMessagesAsync(info.token, info.profileUrl)),
                this.expiringLoad(Entities.EntityType.FriendRequests, () => this.loader.getFriendRequestsAsync(info.token)),
                this.expiringLoad(Entities.EntityType.MessageRequests, () => this.loader.getMessageRequestsAsync(info.token, info.profileUrl))
            ]), (entities: Entities.FacebookEntity[][]) => {
                // concatenate unread message requests
                entities[1] = (entities[3] as Entities.Message[]).filter(message => message.state !== Entities.State.Read).concat(entities[1] as Entities.Message[]);

                const newNotifications: number = entities[0].filter(entity => entity.state !== Entities.State.Read).length;
                const newMessages: number = entities[1].filter(entity => entity.state !== Entities.State.Read).length;
                const newFriendRequests: number = entities[2].filter(entity => entity.state !== Entities.State.Read).length;
                const status: Entities.ResponseStatus = !this.dndEnabled ? Entities.ResponseStatus.Ok : Entities.ResponseStatus.DoNotDisturb;

                return new Entities.Response(status, newNotifications, newMessages, newFriendRequests,
                    (entities[0] as Entities.Notification[]), (entities[1] as Entities.Message[]), (entities[2] as Entities.FriendRequest[]));
            });
        }

        private processResponse(response: Entities.Response): void {
            this.online = response.status === Entities.ResponseStatus.Ok || response.status === Entities.ResponseStatus.DoNotDisturb;
            if (response.status !== Entities.ResponseStatus.Ok)
                return;

            this.checkNew(response.messages, message => message.state === Entities.State.Unread && !message.repliedLast);
            this.checkNew(response.notifications, notification => notification.state === Entities.State.Unseen || notification.state === Entities.State.Unread);
            this.checkNew(response.friendRequests, friendRequest => friendRequest.state === Entities.State.Unread);

            this.chrome.updateBadge(response.newMessages + response.newNotifications + response.newFriendRequests);
        }

        private try<T>(action: (info: Entities.FacebookInfo) => Promise<T>, mapper: (result: T) => Entities.Response): Promise<Entities.Response> {
            return new Promise<Entities.Response>(resolve => {
                (this.info ? Promise.resolve(this.info) : this.loader.getInfoAsync()).then(info => {
                    this.info = info;
                    action(info).then((result: T) => {
                        resolve(mapper(result));
                    }, (error: Extensions.FacebookError) => {
                        this.info = null;
                        console.error(error.toString());
                        resolve(new Entities.Response(error.type));
                    });
                }, (error: Extensions.FacebookError) => {
                    console.error(error.toString());
                    resolve(new Entities.Response(error.type));
                });
            });
        }

        private expiringLoad<T extends Entities.FacebookEntity>(entityType: Entities.EntityType, eagerAction: () => Promise<T[]>): Promise<T[]> {
            return this.loadCache.contains(entityType) ?
                Promise.resolve(this.loadCache.retrieve(entityType)) :
                eagerAction().then(result => {
                    this.loadCache.store(entityType, result);
                    return result;
                });
        }

        private checkNew<T extends Api.INotifiable>(entities: T[], isNewPredicate: (entity: T) => boolean): void {
            for (let entity of entities) {
                if (isNewPredicate(entity))
                    this.notifyOnce(entity);
                else
                    delete this.unread[entity.getId()];
            }
        }

        private notifyOnce(notifiableEntity: Api.INotifiable): void {
            if (notifiableEntity.getText() === this.unread[notifiableEntity.getId()])
                return;
            this.loader.getExternalResourceAsync(notifiableEntity.picture).then(localPicture => {
                notifiableEntity.picture = localPicture || this.settings.notificationIcon;
                this.chrome.createDesktopAlert(notifiableEntity);
            });
            this.playSound();
            this.unread[notifiableEntity.getId()] = notifiableEntity.getText();
        }

        private playSound(): void {
            if (!this.sound)
                this.sound = new Audio(this.settings.sound);
            this.sound.play();
        }

        private set online(value: boolean) {
            if (this.isOnline !== value)
                this.chrome.updateExtensionIcon(value);
            this.isOnline = value;
        }

        private expandCounters(backoffCounts: Extensions.Pair<Entities.EntityType, number>[]): Extensions.Pair<Entities.EntityType, number>[] {
            const result: { [index: string]: number } = {};
            for (let type of Object.keys(Entities.EntityType))
                result[type] = 0;
            for (let count of backoffCounts)
                result[Entities.EntityType[count.first]] = count.second;
            return Object.keys(result).map(s => new Extensions.Pair(Entities.EntityType[s], result[s]));
        }
    }

    class ChromeService {
        private settings: ISettings;
        private notifications: { [id: number]: string };

        constructor(settings: ISettings) {
            this.settings = settings;
            this.notifications = {};
        }

        public createDesktopAlert(notifiableEntity: Api.INotifiable): void {
            if (chrome && chrome.notifications) {
                chrome.notifications.create(notifiableEntity.getId(), {
                    type: "basic",
                    title: notifiableEntity.getTitle(),
                    message: notifiableEntity.getText(),
                    contextMessage: this.settings.contextMessage,
                    iconUrl: notifiableEntity.picture
                }, (id) => {
                    setTimeout(() => {
                        chrome.notifications.clear(id, () => { });
                        delete this.notifications[id];
                    }, this.settings.notificationFadeoutDelay);
                });

                this.notifications[notifiableEntity.getId()] = notifiableEntity.getUrl();
            }
        }

        public registerGlobalListeners(): void {
            if (chrome && chrome.notifications) {
                chrome.notifications.onClicked.addListener((id) => {
                    this.createOrUpdateTab(this.notifications[id]);
                    chrome.notifications.clear(id, () => { });
                    delete this.notifications[id];
                });
            }

            if (chrome && chrome.webRequest) {
                chrome.webRequest.onBeforeSendHeaders.addListener(details => {
                    var headers: chrome.webRequest.HttpHeader[] = details.requestHeaders;
                    var refererFound: boolean = false, originFound: boolean = false;

                    for (let header of headers) {
                        if (header.name === "Referer") {
                            header.value = this.settings.baseUrl;
                            refererFound = true;
                        }
                        if (header.name === "Origin") {
                            header.value = this.settings.baseUrl;
                            originFound = true;
                        }
                    }

                    if (!refererFound) headers.push({ name: "Referer", value: this.settings.baseUrl });
                    if (!originFound) headers.push({ name: "Origin", value: this.settings.baseUrl });

                    return { requestHeaders: headers };
                }, { urls: ["<all_urls>"] }, ["requestHeaders", "blocking"]);
            }
        }

        public registerPublicApi(backendService: Api.IBackendService) {
            if (chrome && chrome.runtime) {
                chrome.runtime.onMessage.addListener((message: Entities.Request, sender, sendResponse: (response: Entities.Response) => void) => {
                    if (typeof backendService[message.action] !== "function")
                        return false;
                    const parameters = $.extend([], message.parameters);
                    parameters.push(sendResponse);
                    backendService[message.action].apply(backendService, parameters);
                    return true;
                });
            }
        }

        public updateBadge(value: number | string): void {
            if (chrome && chrome.browserAction) {
                if (typeof value === "number") {
                    chrome.browserAction.setBadgeBackgroundColor({ color: this.settings.badgeAlertColor });
                    chrome.browserAction.setBadgeText({ text: value > 0 ? value.toString() : "" });
                } else {
                    chrome.browserAction.setBadgeBackgroundColor({ color: this.settings.badgeNormalColor });
                    chrome.browserAction.setBadgeText({ text: value });
                }
            }
        }

        public updateExtensionIcon(online: boolean): void {
            if (chrome && chrome.browserAction)
                chrome.browserAction.setIcon({ path: (online ? this.settings.onlineIcon : this.settings.offlineIcon) });
        }

        public createOrUpdateTab(url: string): void {
            if (chrome && chrome.tabs) {
                chrome.tabs.query({ url: url }, (tabs) => {
                    if (tabs.length > 0)
                        chrome.tabs.update(tabs[0].id, { url: url, active: true });
                    else
                        chrome.tabs.create({ url: url });
                });
            }
        }
    }

    class Loader implements Api.ILoader {
        private static get NOTIFICATION_URI(): string { return "/ajax/notifications/client/get.php"; }
        private static get MESSAGE_URI(): string { return "/api/graphqlbatch"; }
        private static get FRIEND_REQUEST_URI(): string { return "/ajax/requests/loader"; }

        private static get MARK_NOTIFICATION_READ_URI(): string { return "/ajax/notifications/mark_read.php"; }
        private static get MARK_MESSAGE_READ_URI(): string { return "/ajax/mercury/change_read_status.php"; }
        private static get RESOLVE_FRIEND_REQUEST_URI(): string { return "/ajax/reqs.php?dpr=1"; }

        private settings: ISettings;
        private localResources: { [url: string]: string };

        constructor(settings: ISettings) {
            this.settings = settings;
            this.localResources = {};
        }

        public getInfoAsync(): Promise<Entities.FacebookInfo> {
            return new Promise<Entities.FacebookInfo>((resolve, reject) => {
                $.ajax({
                    url: this.settings.baseUrl,
                    method: "GET",
                    accepts: "*/*"
                }).done((result: string) => {
                    result = result.replace(/<img\b[^>]*>/ig, "");
                    if ($(result).find("#login_form").length === 0)
                        resolve(this.parseInfo(result));
                    else
                        reject(new Extensions.FacebookError(Entities.ResponseStatus.Unauthorized));
                }).fail(() => {
                    reject(new Extensions.FacebookError(Entities.ResponseStatus.ConnectionRejected));
                });
            });
        }

        public getNotificationsAsync(token: string): Promise<Entities.Notification[]> {
            return new Promise<Entities.Notification[]>((resolve, reject) => {
                $.ajax({
                    url: this.settings.baseUrl + Loader.NOTIFICATION_URI + this.settings.uriSuffix,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: { length: this.settings.fetchLimit, __a: 1, fb_dtsg: token }
                }).done((result: string) => {
                    const response = JSON.parse((result).match(/{.*}/)[0]);
                    if (!response.error)
                        resolve(this.parseNotifications(response.payload));
                    else
                        reject(new Extensions.FacebookError(response.error === 1357001 ?
                            Entities.ResponseStatus.Unauthorized : Entities.ResponseStatus.IllegalToken, response));
                }).fail(() => {
                    reject(new Extensions.FacebookError(Entities.ResponseStatus.ConnectionRejected));
                });
            });
        }

        public getMessagesAsync(token: string, profileUrl: string): Promise<Entities.Message[]> {
            return this.getMessagesOfTypeAsync("INBOX", token, profileUrl);
        }

        public getMessageRequestsAsync(token: string, profileUrl: string): Promise<Entities.Message[]> {
            return this.getMessagesOfTypeAsync("PENDING", token, profileUrl);
        }

        public getFriendRequestsAsync(token: string): Promise<Entities.FriendRequest[]> {
            return new Promise<Entities.FriendRequest[]>((resolve, reject) => {
                $.ajax({
                    url: this.settings.baseUrl + Loader.FRIEND_REQUEST_URI,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: { __a: 1, fb_dtsg: token }
                }).done((result: string) => {
                    const response = JSON.parse((result).match(/{.*}/)[0]);
                    if (!response.error && response.domops && response.domops[0] && response.domops[0][3] && response.domops[0][3].__html)
                        resolve(this.parseFriendRequests(response.domops[0][3].__html));
                    else
                        reject(new Extensions.FacebookError(response.error === 1357001 ?
                            Entities.ResponseStatus.Unauthorized : Entities.ResponseStatus.IllegalToken, response));
                }).fail(() => {
                    reject(new Extensions.FacebookError(Entities.ResponseStatus.ConnectionRejected));
                });
            });
        }

        public getExternalResourceAsync(url: string): Promise<string> {
            return new Promise<string>(resolve => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        window.URL.revokeObjectURL(this.localResources[url]);
                        this.localResources[url] = window.URL.createObjectURL(xhr.response);
                        resolve(this.localResources[url]);
                    } else {
                        resolve(null);
                    }
                };
                xhr.send(null);
            });
        }

        public markNotificationRead(token: string, id: string): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                $.ajax({
                    url: this.settings.baseUrl + Loader.MARK_NOTIFICATION_READ_URI + this.settings.uriSuffix,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: { "alert_ids[0]": id, from_read_button: true, fb_dtsg: token }
                }).done(() => {
                    resolve();
                }).fail(() => {
                    reject(new Extensions.FacebookError(Entities.ResponseStatus.ConnectionRejected));
                });
            });
        }

        public markMessageRead(token: string, id: string): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                const data: any = {};
                data[`ids[${id}]`] = true;
                data.fb_dtsg = token;
                data.shouldSendReadReceipt = true;
                data.__a = 1;

                $.ajax({
                    url: this.settings.baseUrl + Loader.MARK_MESSAGE_READ_URI + this.settings.uriSuffix,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: data
                }).done(() => {
                    resolve();
                }).fail(() => {
                    reject(new Extensions.FacebookError(Entities.ResponseStatus.ConnectionRejected));
                });
            });
        }

        public resolveFriendRequest(token: string, id: string, accept: boolean): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                const data: any = {};
                data[`actions[${accept ? "accept" : "reject"}]`] = 1;
                data.type = "friend_connect";
                data.request_id = id;
                data.confirm = id;
                data.list_item_id = `${id}_1_req`;
                data.status_div_id = `${data.list_item_id}_status`;
                data.fb_dtsg = token;
                data.__a = 1;

                $.ajax({
                    url: this.settings.baseUrl + Loader.RESOLVE_FRIEND_REQUEST_URI,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: data
                }).done(() => {
                    resolve();
                }).fail(() => {
                    reject(new Extensions.FacebookError(Entities.ResponseStatus.ConnectionRejected));
                });
            });
        }

        private getMessagesOfTypeAsync(type: string, token: string, profileUrl: string): Promise<Entities.Message[]> {
            return new Promise<Entities.Message[]>((resolve, reject) => {
                const data: any = {};
                // TODO hardcoded doc_id https://github.com/carpedm20/fbchat/issues/241
                data.queries = JSON.stringify({ "o0": { "doc_id": "1349387578499440", "query_params": { "limit": this.settings.fetchLimit, "tags": [type] } } });
                data.fb_dtsg = token;
                data.__a = 1;

                $.ajax({
                    url: this.settings.baseUrl + Loader.MESSAGE_URI,
                    method: "POST",
                    accepts: "*/*",
                    dataType: "text",
                    data: data
                }).done((result: string) => {
                    const separator: number = result.lastIndexOf("{");
                    const status = JSON.parse(result.substring(separator));
                    if (status.successful_results > 0) {
                        const response = JSON.parse(result.substring(0, separator));
                        resolve(this.parseMessages(response.o0.data.viewer.message_threads.nodes, profileUrl));
                    } else
                        reject(new Extensions.FacebookError(Entities.ResponseStatus.IllegalToken));
                }).fail(() => {
                    reject(new Extensions.FacebookError(Entities.ResponseStatus.ConnectionRejected));
                });
            });
        }

        private parseInfo(result: string): Entities.FacebookInfo {
            const token: string = result.match(/name="fb_dtsg" value="(.*?)" autocomplete/)[1];
            const profileUrl: string = $(result).find("a[title='Profile']").attr("href");

            return new Entities.FacebookInfo(token, profileUrl);
        }

        private parseNotifications(json: any): Entities.Notification[] {
            return (json.nodes as Array<any>).map(notification => {
                const emphases: Extensions.Range[] = (notification.title.ranges as Array<any>).map(entity => new Extensions.Range(entity.offset, entity.offset + entity.length));
                const authors: Entities.Author[] = this.extractAuthors(notification);
                const state: Entities.State = this.parseState(notification.seen_state as string);
                const timestamp: string = this.formTimestampText(notification.timestamp.text, json.servertime - notification.timestamp.time);
                const attachment: string = notification.previewImage && notification.previewImage.uri;

                return new Entities.Notification(notification.id, notification.title.text, emphases, authors, authors[0].profilePicture, state, notification.alert_id.split(":")[1], timestamp, notification.url, notification.icon.uri, attachment);
            });
        }

        private parseMessages(messages: any, profileUrl: string): Entities.Message[] {
            return (messages as Array<any>).map(message => {
                const participants: { [id: string]: Entities.Author; } = {};
                const participantIds: string[] = [];
                let userId: string;
                for (let participant of message.all_participants.nodes) {
                    const messagingActor: any = participant.messaging_actor;
                    participants[messagingActor.id] = new Entities.Author(messagingActor.name, messagingActor.big_image_src.uri, messagingActor.short_name);
                    if (messagingActor.url === profileUrl)
                        userId = messagingActor.id;
                    else
                        participantIds.push(messagingActor.id);
                }
                const authors: Entities.Author[] = participantIds.map(participantId => participants[participantId]);
                const header: string = !message.name || message.name.length === 0 ? authors.map(author => author.fullName).join(", ") : message.name;
                const lastMessage: any = message.last_message.nodes[0];
                const repliedLast: boolean = lastMessage.message_sender.messaging_actor.id === userId;
                const lastSender: Entities.Author = participants[lastMessage.message_sender.messaging_actor.id];
                const text: string = this.formMessageText(lastMessage.snippet, /* TODO extension + sticker */ null,
                    !repliedLast && authors.length > 1, !repliedLast ? lastSender.shortName : "You");
                const picture: string = lastSender.profilePicture;
                const state: Entities.State = this.parseState(!repliedLast ? message.unread_count as number : 0);
                const id: string = message.thread_key.thread_fbid || message.thread_key.other_user_id;
                const url: string = this.settings.baseUrl + this.settings.messagePrefix + id;
                const seenByAll: boolean = message.read_receipts.nodes.length > participantIds.length &&
                    message.read_receipts.nodes.every(node => node.action >= lastMessage.timestamp_precise);
                const emoticons: Extensions.Pair<Extensions.Range, string>[] = Extensions.EmoticonHelper.identifyEmoticons(text);

                return new Entities.Message(id, header, text, authors, picture, state, id, message.timestamp_relative, url, repliedLast, seenByAll, emoticons);
            });
        }

        private parseFriendRequests(html: string): Entities.FriendRequest[] {
            return $(html).find(".fbRequestList:first .objectListItem").toArray().map((friendRequest: HTMLLIElement) => {
                const $friendRequest: JQuery = $(friendRequest);
                const id: string = $friendRequest.find("form input[name='request_id']").val();
                const picture: string = $friendRequest.find("img:first").attr("src");
                const links: HTMLAnchorElement[] = $friendRequest.find(".requestStatusBlock span a").toArray();
                const requestor: Entities.Author = new Entities.Author(links[0].innerText, picture, links[0].innerText.split(" ")[0]);
                const state: Entities.State = this.parseState($friendRequest.hasClass("jewelItemNew"));
                const url: string = links[0].href;
                const mutualFriendText: string = links[1] ? links[1].parentElement.innerText : null;
                const mutualFriendTooltip: string = links[1] ? this.settings.baseUrl + links[1].pathname + links[1].search : null;

                return new Entities.FriendRequest(id, requestor.fullName, requestor, picture, state, url, mutualFriendText, mutualFriendTooltip);
            });
        }

        private parseState(state: boolean | number | string): Entities.State {
            if (typeof state === "number" || typeof state === "boolean") {
                return !state ? Entities.State.Read : Entities.State.Unread;
            } else {
                switch (state) {
                    case "UNSEEN_AND_UNREAD":
                        return Entities.State.Unseen;
                    case "SEEN_BUT_UNREAD":
                        return Entities.State.Unread;
                    case "SEEN_AND_READ":
                        return Entities.State.Read;
                    default:
                        return null;
                }
            }
        }

        private formTimestampText(text: string, timeInSeconds: number): string {
            if (text && text.length !== 0)
                return text;
            const minutes: number = Math.floor(timeInSeconds / 60);
            return (minutes < 60) ?
                (minutes === 0 ? "a few seconds ago" : `${minutes} minute${minutes !== 1 ? "s" : ""} ago`) :
                `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) !== 1 ? "s" : ""} ago`;
        }

        private formMessageText(text: string, attachmentType: string, usePrefix: boolean, authorName: string): string {
            const prefix: string = usePrefix ? `${authorName}: ` : "";
            return (text && text.length !== 0) || !attachmentType ?
                prefix + text :
                prefix + `<${authorName} sent a ${attachmentType}>`;
        }

        private extractAuthors(notification: any): Entities.Author[] {
            // new api
            if (notification.thumbnail)
                return [new Entities.Author("", notification.thumbnail.uri, "")];
            // legacy api
            else
                return (notification.actors as Array<any>).map(author => new Entities.Author(author.name, author.profile_picture.uri, author.name.split(" ")[0]));
        }
    }

    window.onload = () => {
        const settings: ISettings = {
            baseUrl: "https://www.facebook.com",
            uriSuffix: "?__pc=EXP1%3ADEFAULT",
            refreshInterval: 20 * 1000,
            backoffCounts: [
                new Extensions.Pair(Entities.EntityType.FriendRequests, 30),
                new Extensions.Pair(Entities.EntityType.MessageRequests, 15)
            ],
            notificationFadeoutDelay: 10 * 1000,
            fetchLimit: 5,
            messagePrefix: "/messages/t/",
            sound: "chime.ogg",
            contextMessage: "www.facebook.com",
            notificationIcon: "Images/icon48.png",
            onlineIcon: "Images/icon19.png",
            offlineIcon: "Images/icon-loggedout.png",
            badgeAlertColor: [232, 76, 61, 255],
            badgeNormalColor: [0, 0, 0, 255]
        };

        const loader: Api.ILoader = new Loader(settings);
        const chrome: ChromeService = new ChromeService(settings);
        const worker: BackgroundWorker = new BackgroundWorker(settings, loader, chrome);

        chrome.registerGlobalListeners();
        chrome.registerPublicApi(worker);
        worker.start();
    };
}