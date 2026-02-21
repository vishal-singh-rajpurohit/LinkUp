export const ChatEventsEnum = Object.freeze({
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
})

export const callEventEnum = Object.freeze({
    MAKE_VIDEO_CALL: "call:request",
    INCOMING_VIDEO_CALL: "incoming-video-call",
    ANSWER_CALL: "call:answer",
    CALL_ANSWERED: "call:answered",

    NEGOTIATION_NEEDED: 'call:nego:needed',
    NEGOTIATION_INCOMING: 'call:nego:incoming',
    NEGOTIATION_DONE: 'call:nego:done',
    NEGOTIATION_FINAL: 'call:nego:FINAL',



    CANCELLED_BEFORE_ANSWER: "cancelled-before-answer",
    STOP_CALLING: "stop-calling",
    DENAY_CALL: "denay-call",
    USER_LEFT_CALL: "user-left-call",

    DISCART_VIDEO_CLL: "discart-video-call",
})

export const STUN_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
];