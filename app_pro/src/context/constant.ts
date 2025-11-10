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

export const CallEventEnum = {
    REQUEST_VIDEO_CALL: "request_video_call",

    REQUESTED_VIDEO_CALL: 'requested_video_call',
    
    END_VIDEO_CALL: 'end_video_call',

    CALL_EVENT_ERROR: "call_event"
}

export const CallEventEnum_2 = {
    REQUEST_VIDEO_CALL: "request_video_call",
    REJECT_VIDEO_CALL: "reject_video_call",

    CALLER_UPDATE: 'caller_update'
}

export const STUN_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
];