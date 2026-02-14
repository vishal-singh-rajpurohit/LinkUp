const chatEventEnumNew = {
  CONNECTED_EVENT: 'connected',
  DISCONNECT_EVENT: 'disconnect',
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
  TYPING_EVENT: 'typing',
  MESSAGE_DELETE_EVENT: 'messageDeleted',
  SOCKET_ERROR_EVENT: 'socketError',
  NEW_MESSAGE: "message",
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

const LoadLimits = Object.freeze({
  CONTACT_LIMIT: 50,
  CHAT_LIMIT: 100,
});

module.exports = { chatEventEnumNew, CallEventEnum,  LoadLimits };
