const ChatEventEnum = Object({
  CONNECTED_EVENT: "connected",
  DISCONNECT_EVENT: "disconnect",
  JOIN_CHAT_EVENT: "joinChat",
  LEAVE_CHAT_EVENT: "leaveChat",
  UPDATE_GROUP_NAME: "updateGroupName",
  MESSAGE_RECIVED_EVENT: "messageRecieved",
  NOTIFY_USERS_EVENT: "notifyUsers",
  MESSAGE_UNDO_EVENT: "messageUndo",
  NEW_CHAT_EVENT: "newChat",
  SOCKET_EVENT_ERROR: "socketError",
  STOP_TYPING_EVENT: "stopTyping",
  TYPING_EVENT: "typing",
  MESSAGE_DELETE_EVENT: "messageDeleted",
  SOCKET_ERROR_EVENT: "socketError",

  REQUEST_VIDEO_CALL: "requestVideoCall",
  REJECT_VIDEO_CALL: "rejectVideoCall",
  ACCEPT_VIDEO_CALL: "acceptVideoCall",
  CLOSE_VIDEO_CALL: "closeVideoCall",
  REQUEST_AUDIO_CALL: "requestAudioCall",
  ACCEPT_AUDIO_CALL: "acceptAudioCall",
  REJECT_AUDIO_CALL: "rejectAudioCall",
  CLOSE_AUDIO_CALL: "closeAudioCall",
});

const chatEventEnumNew = {
  ONLINE_EVENT: "is_online",
  OFFLINE_EVENT: "offline",
  APPROACHED_TALK: "apprached_to_talk",
  NEW_GROUP_CHAT: "created_room",
  KICKED_OUT_MEMBER: "cickout_member",
  KICKED_OUT_YOU: "you_member",
  NEW_MESSAGE: "message",
  DELETED_MESSAGE: "deleted_message",
  TYPING_ON: "typing_on",
  TYPING_OFF: "typing_off",
};

const LoadLimits = Object.freeze({
  CONTACT_LIMIT: 50,
  CHAT_LIMIT: 100,
});

module.exports = { ChatEventEnum, chatEventEnumNew, LoadLimits };
