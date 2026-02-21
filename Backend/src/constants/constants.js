const chatEventEnumNew = {
  CONNECTED_EVENT: 'connected',
  DISCONNECT_EVENT: 'disconnect',
  ONLINE_EVENT: "is_online",
  OFFLINE_EVENT: "offline",
  JOIN_CHAT_EVENT: 'joinChat',
  LEAVE_CHAT_EVENT: 'leaveChat',
  UPDATE_GROUP_NAME: 'updateGroupName',
  MESSAGE_RECIVED_EVENT: 'messageRecieved',
  NOTIFY_USERS_EVENT: 'notifyUsers',
  MESSAGE_UNDO_EVENT: 'messageUndo',
  NEW_CHAT_EVENT: 'newChat',
  SOCKET_EVENT_ERROR: 'socketError',
  DELETED_MESSAGE: "deleted_message",
  STOP_TYPING_EVENT: 'stopTyping',

  TYPING_ON: 'typing_on',
  TYPING_OFF: 'typing_off',

  MARK_READ: "mark_read",
  MARKED: "marked_read",

  MESSAGE_DELETE_EVENT: 'messageDeleted',
  SOCKET_ERROR_EVENT: 'socketError',
  NEW_MESSAGE: "message"
}

const CallEventEnum = {

  // Done
  REQUEST_VIDEO_CALL: "request_video_call",

  // Pending
  REQUESTED_VIDEO_CALL: 'requested_video_call',

  INCOMING_VIDEO_CALL: 'incoming_video_call',

  ANSWER_VIDEO_CALL: 'answer_video_call',

  ACCEPTED_VIDEO_CALL: 'accepted_video_call',
}


const callEventEnum = Object.freeze({
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

const LoadLimits = Object.freeze({
  CONTACT_LIMIT: 50,
  CHAT_LIMIT: 100,
});

module.exports = { chatEventEnumNew, CallEventEnum, callEventEnum, LoadLimits };
