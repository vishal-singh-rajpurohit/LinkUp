export const ChatEventsEnum = {
    ONLINE_EVENT: "is_online",
    OFFLINE_EVENT: "offline",
    APPROACHED_TALK: "apprached_to_talk",
    NEW_GROUP_CHAT: "created_room",
    KICKED_OUT_MEMBER: "cickout_member",
    KICKED_OUT_YOU: "you_member",
    NEW_MESSAGE: "message",
    MESSAGE_DELETED: "del_message",
    DELETED_MESSAGE: "deleted_message",
    TYPING_ON: 'typing_on',
    TYPING_OFF: 'typing_off',
    MARK_READ: "mark_read",
    MARKED: "marked_read",
    SENDING_MEDIA: "sending_media",
    SENT_MEDIA: "sent_media",
}

export const STUN_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
];