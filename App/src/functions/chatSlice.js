import { createSlice } from "@reduxjs/toolkit";

const chatsInitialState = {
  chatType: "oneOnOne",
  chats: [],
  selectedContact: {
    userName: null,
    avatar: null,
    _id: null,
    isOnline: null,
    searchTag: null,
    callerId: null
  },
};

function selectContactToTalk(state, action) {
  console.log("SelectedConatctTalk Redux");
  if(action.payload.nn){
    state.selectedContact = {
      userName: null,
      callerId: null,
      avatar: null,
      _id: null,
      searchTag: null,
      isOnline: null,
    };
  }
  else if (state.chatType === "oneOnOne") {
    state.selectedContact = {
      userName: action.payload.user.contact_name,
      callerId: action.payload.user.contact_user_id,
      avatar: action.payload.user.contact_det.avatar,
      _id: action.payload.user.contact_det._id,
      searchTag: action.payload.user.chat_members.searchTag,
      isOnline: action.payload.user.contact_det.isOnline,
    };
  } else if (state.chatType === "groupChat") {
    console.log("select Redux toolkit: ",action.payload.user.contact_det);
    state.selectedContact = {
      userName: action.payload.user.contact_det.groupName,
      avatar: null,
      _id: action.payload.user.contact_det._id,
      searchTag: "group",
      isOnline: null,
    };
    console.log("select Redux toolkit: ",state.selectedContact);
  } else if (state.chatType === "safe") {
    state.selectedContact = {
      userName: action.payload.user.contact_name,
      avatar: action.payload.user.contact_det.avatar,
      _id: action.payload.user.contact_det._id,
      searchTag: action.payload.user.chat_members.searchTag,
      isOnline: action.payload.user.contact_det.isOnline,
    };
  }
  console.log("SelectedConatctTalk Redux: ", state.selectedContact);
}

function switchChatMode(state, action) {
  console.log("switch mode Redux: ", state);
  state.chatType = action.payload.chatType;
  console.log("switch mode Redux: ", state.chatType);
}

function setChatArray(state, action) {
  state.chats = action.payload.chats;
}

function appendChat(state, action) {
  state.chats = [...state.chats, action.payload.payload];
}

function deleteChat(state, action) {
  state.chats = state.chats.filter(
    (message) => message._id !== action.payload.payload._id
  );
}

const chatSlice = createSlice({
  name: "chats",
  initialState: chatsInitialState,
  reducers: {
    switchChatType: switchChatMode,
    selectContact: selectContactToTalk,
    setChats: setChatArray,
    appendRealtimeChat: appendChat,
    undoRealtimeChat: deleteChat,
  },
});

export const { selectContact, switchChatType, setChats, appendRealtimeChat, undoRealtimeChat} =
  chatSlice.actions;
export default chatSlice.reducer;
