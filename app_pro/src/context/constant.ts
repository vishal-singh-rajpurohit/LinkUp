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


    CANCELLED_VIDEO_CALL: "cancelled_video_call",
    REJECT_VIDEO_CALL: "reject_video_call",
    REJECTED_VIDEO_CALL: "rejected_video_call",
    TRANSPORT_CONNECT: "transport_connect",
    TRANSPORT_PRODUCE: "transprt_produce",
    TRANSPORT_RECIVER_CONNECT: "transport_recv_connect",
    CONSUME: "consume",
    ON_CONSUMER_RESUME: "on_consumer_resume",
    OFFLINE_CALLER: "offline_caller",
    REQUEST_VIDEO_ROOM_TEST: 'request_video_call_test',
    INCOMING_VIDEO_ROOM_TEST: 'incoming_video_call_test',
    JOIN_VIDEO_ROOM_TEST: 'join_video_test',
    JOINED_VIDEO_ROOM_TEST: 'joinee_video_test',
}

export const CallEventEnum = {
    REQUEST_VIDEO_CALL: "request_video_call",
    REQUESTED_VIDEO_CALL: 'requested_video_call',
    INCOMING_VIDEO_CALL: "incoming_video_call",
    ANSWER_VIDEO_CALL: "answer_video_call",
    ACCEPTED_VIDEO_CALL: "accepted_video_call",
    CREATE_WEB_RTC_TRANSPORT: 'createWebRtcTransport',
    CREATED_WEB_RTC_TRANSPORT: 'sendWebRtcTransport',

    CONNECT_TRANSPORT: "connectTransport",
    TRANSPORT_CONNECTED: "transportConnected",

    PRODUCE: "produce",
    PRODUCER_CREATED: "producerCreated",
    NEW_PRODUCER: 'new_member',
    PRODUCER_STATE_CHANGED: 'producer_state_changed',
    PRODUCER_CLOSED: 'producerClosed',
 
    CONSUME: 'consume',
    CONSUMER_CREATED: 'consumer_created',
    ON_CONSUMER_RESUME: 'on_consumer_resume',

    TRANSPORT_CONNECT: "transportConnect",
    CONNECTED_TRANSPORT: "Connected_Transport",

    CALL_EVENT_ERROR: "call_event"
}