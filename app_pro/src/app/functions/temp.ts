import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type contactTypes, type groupMssageType, type groupType } from './auth'

export interface searchUserTypes {
    _id: string;
    searchTag: string;
    avatar: string;
    isOnline: boolean
}

export interface groupContactTypes {
    _id: string;
    userId: string;
    searchTag: string;
    avatar: string;
    admin?: boolean;
}

interface temporalTypes {
    _id: string;
    userId: string;
    avatar: string;
    searchTag: string;
}

interface chatStates {
    hasAttechments: boolean
}

interface replyState {
    isReplay: boolean;
    _id: string;
    senderTag: string;
}

interface initialStateTypes {
    searchUsers: searchUserTypes[];
    activeGroup: boolean;
    activeAddToGroup: boolean;
    kickOutGroup: boolean;
    kickOutWarning: boolean;
    selectedContact: contactTypes;
    groupContact: groupContactTypes[];
    notificationPopUp: boolean;
    chatListTypes: number; // 1 -> single, 2-> group, 3 -> archieved
    tempUser: temporalTypes[];
    tempString: string;
    chatStates: chatStates;
    replayTemp: replyState;
    typing: {
        trigger: boolean;
        user: string;
    };
    fileSelection: boolean;
    emojiSelection: boolean;
    uploadingState: boolean;
    fileType: string;
    requestedVideoCall: boolean;
    incomingVideoCall: boolean;
    isCalling: boolean;
    cannotConnect: boolean;
    callDetails: {
        roomId: string;
        searchTag: string;
        avatar: string;
        callId: string;
    }
}

const initialState: initialStateTypes = {
    searchUsers: [],
    activeGroup: false,
    activeAddToGroup: false,
    kickOutGroup: false,
    kickOutWarning: false,
    notificationPopUp: false,
    typing: {
        trigger: false,
        user: ""
    },
    selectedContact: {
        _id: "",
        userId: "",
        avatar: "",
        roomId: "",
        socketId: "",
        searchTag: "",
        userName: "",
        email: "",
        isBlocked: false,
        isArchieved: false,
        lastMessage: "",
        isOnline: false,
    },
    groupContact: [],
    chatListTypes: 1,
    tempUser: [],
    tempString: "",
    chatStates: {
        hasAttechments: false
    },
    replayTemp: {
        _id: "",
        isReplay: false,
        senderTag: "",
    },
    fileSelection: false,
    emojiSelection: false,
    fileType: "",
    uploadingState: false,

    incomingVideoCall: false,
    requestedVideoCall: false,
    isCalling: false,
    cannotConnect: false,
    callDetails: {
        roomId: "",
        searchTag: "",
        avatar: "",
        callId: "",
    }
}

function searchingFunc(state: initialStateTypes, action: PayloadAction<{ users: searchUserTypes[] }>) {
    state.searchUsers = action.payload.users
}

function selectConFunc(state: initialStateTypes, action: PayloadAction<{ chat: contactTypes }>) {
    console.log('chat is: ', action.payload.chat);

    state.selectedContact = {
        _id: action.payload.chat._id,
        lastMessage: action.payload.chat.lastMessage,
        isBlocked: action.payload.chat.isBlocked,
        isArchieved: action.payload.chat.isArchieved,
        roomId: action.payload.chat.socketId,
        time: action.payload.chat.time,
        userId: action.payload.chat.userId,
        avatar: action.payload.chat.avatar,
        socketId: action.payload.chat.socketId,
        searchTag: action.payload.chat.searchTag,
        userName: action.payload.chat.userName,
        email: action.payload.chat.email,
        isOnline: action.payload.chat.isOnline,
        messages: action.payload.chat.messages
    }
}

function selectGpFunc(state: initialStateTypes, action: PayloadAction<{ chat: groupType }>) {
    state.selectedContact = {
        _id: action.payload.chat._id,
        avatar: action.payload.chat.avatar,
        email: "",
        isOnline: false,
        isArchieved: action.payload.chat.isArchieved,
        lastMessage: action.payload.chat.lastMessage,
        roomId: action.payload.chat.roomId,
        isBlocked: false,
        isGroup: action.payload.chat.isGroup,
        searchTag: "",
        socketId: action.payload.chat.roomId,
        time: action.payload.chat.time,
        userId: "",
        userName: action.payload.chat.groupName,
        messages: action.payload.chat.messages,
        members: action.payload.chat.members
    }
}

function addGroupContact(state: initialStateTypes, action: PayloadAction<{ user: groupContactTypes }>) {
    let find: boolean = false;

    for (const val of state.groupContact) {
        if (val._id === action.payload.user._id) {
            find = true
        }
    }

    if (find) {
        state.groupContact = state.groupContact.filter((value) => value._id !== action.payload.user._id)
    } else {
        state.groupContact = [action.payload.user, ...state.groupContact]
    }
}

function addGroupAdmin(state: initialStateTypes, action: PayloadAction<{ user: groupContactTypes }>) {
    const user = state.groupContact.filter((val) => val._id === action.payload.user._id)

    // console.log(`filtered user: ${JSON.stringify(user, null, 2)}`);

    if (!user[0].admin) {
        user[0].admin = true
        const prevUser = state.groupContact.filter((val) => val._id !== action.payload.user._id)
        state.groupContact = [...prevUser, user[0]]
    } else if (user[0].admin) {
        user[0].admin = false
        const prevUser = state.groupContact.filter((val) => val._id !== action.payload.user._id)
        state.groupContact = [...prevUser, user[0]]
    }

    // console.log(`filtered user: ${JSON.stringify(state.groupContact, null, 2)}`);
}

function clearGroupCon(state: initialStateTypes) {
    state.groupContact = []
}

function changeContactTypesFunc(state: initialStateTypes, action: PayloadAction<{ trigger: number }>) {
    state.chatListTypes = action.payload.trigger
}

function blockFunc(state: initialStateTypes, action: PayloadAction<{ trigger: boolean }>) {
    if (state.selectedContact?._id) {
        state.selectedContact.isBlocked = action.payload.trigger
    }
}

function clearTemo(state: initialStateTypes) {
    state.activeGroup = false;
    state.chatListTypes = 1;
    state.groupContact = [];
    state.searchUsers = [];
    state.tempUser = [];
    state.typing = {
        trigger: false,
        user: ""
    };
    state.selectedContact = {
        _id: "",
        userId: "",
        avatar: "",
        roomId: "",
        socketId: "",
        searchTag: "",
        userName: "",
        email: "",
        isBlocked: false,
        isArchieved: false,
        lastMessage: "",
        isOnline: false,
    };
    state.replayTemp = {
        _id: "",
        isReplay: false,
        senderTag: ""
    };
    state.fileSelection = false;
    state.uploadingState = false;
    state.fileType = ""
}

function setTemporalUser(state: initialStateTypes, action: PayloadAction<{
    contacts: {
        _id: string;
        userId: string;
        avatar: string;
        searchTag: string;
    }
}>) {
    let find: boolean = false;
    const newContact: temporalTypes = {
        _id: action.payload.contacts._id || action.payload.contacts.userId,
        avatar: action.payload.contacts.avatar,
        searchTag: action.payload.contacts.searchTag,
        userId: action.payload.contacts.userId
    }

    for (const val of state.tempUser) {
        if (val._id === newContact._id) {
            find = true
        }
    }

    if (find) {
        state.tempUser = [...(state.tempUser.filter((val) => val._id !== newContact._id))];
    } else {
        state.tempUser = [newContact, ...state.tempUser];
    }


}

function openAddToGroup(state: initialStateTypes, action: PayloadAction<{ trigger: boolean; }>) {
    state.activeAddToGroup = action.payload.trigger
}

function openKickoutModel(state: initialStateTypes, action: PayloadAction<{ trigger: boolean; }>) {
    state.kickOutGroup = action.payload.trigger
}

function openKickoutWarning(state: initialStateTypes, action: PayloadAction<{ trigger: boolean; }>) {
    state.kickOutWarning = action.payload.trigger
}

function setTemproryString(state: initialStateTypes, action: PayloadAction<{ text: string; }>) {
    state.tempString = action.payload.text;
}

function removeMemberFromGroup(state: initialStateTypes, action: PayloadAction<{ text: string }>) {
    if (state.selectedContact?.members) {
        const updatedMember = state.selectedContact.members.filter((member) => member._id !== action.payload.text);
        state.selectedContact.members = updatedMember
    }
}

function setGroupAvatar(state: initialStateTypes, action: PayloadAction<{ avatar: string; }>) {
    if (state.selectedContact) state.selectedContact.avatar = action.payload.avatar
}

// Socket Events
function setOnline(state: initialStateTypes, action: PayloadAction<{ contactId: string; trigger: boolean }>) {
    if (state.selectedContact._id === action.payload.contactId) {
        state.selectedContact.isOnline = action.payload.trigger;
        state.selectedContact.time = Date.now();
    }
}

function cickOutMember(state: initialStateTypes, action: PayloadAction<{ groupId: string }>) {
    if (state.selectedContact._id === action.payload.groupId) {
        clearTemo(state)
    }
}

function newMessage(state: initialStateTypes, action: PayloadAction<{ newMsg: groupMssageType, contactId: string }>) {
    if (state.selectedContact._id !== action.payload.contactId) return;
    state.selectedContact.messages = [
        ...(state.selectedContact.messages || []),
        action.payload.newMsg
    ]
}

function uploadingMediaFunc(state: initialStateTypes, action: PayloadAction<{ newMsg: groupMssageType, contactId: string }>) {
    if (state.selectedContact._id !== action.payload.contactId) return;
    state.selectedContact.messages = [
        ...(state.selectedContact.messages || []),
        action.payload.newMsg
    ]
}

function uploadedMediaFunc(state: initialStateTypes, action: PayloadAction<{ newMsg: groupMssageType, contactId: string }>) {
    if (state.selectedContact._id !== action.payload.contactId) return;
    const prevMessages = state.selectedContact.messages?.filter((val) => val._id !== action.payload.newMsg._id)
    state.selectedContact.messages = [
        ...(prevMessages || []),
        action.payload.newMsg
    ]
}

function delMessage(state: initialStateTypes, action: PayloadAction<{ messageId: string; contactId: string; }>) {
    if (state.selectedContact._id !== action.payload.contactId) return;

    const message = state.selectedContact.messages?.filter((val) => val._id === action.payload.messageId)
    if (message?.length) {
        message[0].isDeleted = true;
    }
}

function setTyping(state: initialStateTypes, action: PayloadAction<{ trigger: boolean; avatar: string }>) {
    state.typing = {
        trigger: action.payload.trigger,
        user: action.payload.avatar
    }
}

function setNotification(state: initialStateTypes, action: PayloadAction<{ trigger: boolean }>) {
    state.notificationPopUp = action.payload.trigger
}

function markRead(state: initialStateTypes, action: PayloadAction<{
    messageId: string;
    viewerId: string;
    contactId: string;
}>) {
    if (state.selectedContact._id === action.payload.contactId) {
        const message = state.selectedContact.messages?.filter((msg) => msg._id === action.payload.messageId)
        if (message?.length) {
            message[0].readBy = [
                ...(message[0].readBy || []),
                action.payload.viewerId
            ]
        }
    }
}

// Chat settings
function setHasAttechFunc(state: initialStateTypes, action: PayloadAction<{ trigger: boolean }>) {
    state.chatStates.hasAttechments = action.payload.trigger;
}

function replyStateFunc(state: initialStateTypes, action: PayloadAction<{ trigger: boolean; senderTag: string; messageId: string; }>) {
    state.replayTemp._id = action.payload.messageId;
    state.replayTemp.isReplay = action.payload.trigger;
    state.replayTemp.senderTag = action.payload.senderTag;
}

function fileSelectionTrigger(state: initialStateTypes, action: PayloadAction<{ trigger: boolean; }>) {
    state.fileSelection = action.payload.trigger;
}

function fileEmojiTrigger(state: initialStateTypes, action: PayloadAction<{ trigger: boolean; }>) {
    state.emojiSelection = action.payload.trigger;
}

function triggerUploadingState(state: initialStateTypes, action: PayloadAction<{ trigger: boolean; value: string }>) {
    state.uploadingState = action.payload.trigger;
    state.fileType = action.payload.value
}

function setFileTypeState(state: initialStateTypes, action: PayloadAction<{ tp: string }>) {
    state.fileType = action.payload.tp
}

function clearUploadStateFunc(state: initialStateTypes) {
    state.uploadingState = false;
    state.fileType = ""
}

// Calling
function requestVideoCallFunc(state: initialStateTypes, action: PayloadAction<{
    details: {
        roomId: string;
        searchTag: string;
        avatar: string;
        callId: string;
    }
}>) {
    state.requestedVideoCall = true;
    state.callDetails = action.payload.details
}

function cancelVideoCallFunc(state: initialStateTypes) {
    state.requestedVideoCall = false
}

function incomingVideoCallFunc(state: initialStateTypes, action: PayloadAction<{
    details: {
        roomId: string;
        searchTag: string;
        avatar: string;
        callId: string;
    }
}>) {
    state.incomingVideoCall = true
    state.callDetails = action.payload.details
}

function rejectVideoCallFunc(state: initialStateTypes) {
    state.incomingVideoCall = false
}

function setAnswerCallFunc(state: initialStateTypes, action: PayloadAction<{ trigger: boolean }>) {
    state.isCalling = action.payload.trigger
}

function setCallFailure(state: initialStateTypes, action: PayloadAction<{ trigger: boolean }>) {
    state.cannotConnect = action.payload.trigger;
    state.incomingVideoCall = false;
}

const tempSlice = createSlice({
    name: 'temp',
    initialState: initialState,
    reducers: {
        searching: searchingFunc,
        selectContact: selectConFunc,
        openGroupChat: (state: initialStateTypes, action: PayloadAction<{ trigger: boolean }>) => {
            state.activeGroup = action.payload.trigger
        },
        selectGroup: selectGpFunc,
        appendGroupContact: addGroupContact,
        appendGroupAdmin: addGroupAdmin,
        clearGroupContact: clearGroupCon,
        contactListingFunction: changeContactTypesFunc,
        blockSelected: blockFunc,
        setTempUser: setTemporalUser,
        setAddGroupModal: openAddToGroup,
        setKickoutModal: openKickoutModel,
        setKickoutWarning: openKickoutWarning,
        clearTemp: clearTemo,
        setTempString: setTemproryString,
        kickoutTemp: removeMemberFromGroup,
        updateSelectedAvatar: setGroupAvatar,
        setHasAttechments: setHasAttechFunc,
        removeTempMessage: delMessage,
        triggerOnline: setOnline,
        kickedMeTemp: cickOutMember,
        newMessageInRoom: newMessage,
        setReplyState: replyStateFunc,
        toggleTyping: setTyping,
        notificationPup: setNotification,
        markTempAsRead: markRead,
        setFileSelection: fileSelectionTrigger,
        setEmojiSelection: fileEmojiTrigger,
        setUploadingState: triggerUploadingState,
        triggetUploadType: setFileTypeState,
        clearUploadState: clearUploadStateFunc,
        uploadingMeidaTemp: uploadingMediaFunc,
        uploadedMeidaTemp: uploadedMediaFunc,
        requestVideoCall: requestVideoCallFunc,
        cancelVideoCall: cancelVideoCallFunc,
        incomingVideoCall: incomingVideoCallFunc,
        rejectVideoCall: rejectVideoCallFunc,
        answerCall: setAnswerCallFunc,
        callFailure: setCallFailure,
    }
})


export const { searching, selectContact, selectGroup, openGroupChat, appendGroupContact, clearGroupContact, appendGroupAdmin, contactListingFunction, blockSelected, clearTemp, setTempUser, setAddGroupModal, setKickoutModal, setKickoutWarning, setTempString, kickoutTemp, updateSelectedAvatar, setHasAttechments, removeTempMessage, triggerOnline, kickedMeTemp, newMessageInRoom, setReplyState, toggleTyping, notificationPup, markTempAsRead, setFileSelection, setEmojiSelection, setUploadingState, triggetUploadType, clearUploadState, uploadedMeidaTemp, uploadingMeidaTemp, cancelVideoCall, incomingVideoCall, rejectVideoCall, requestVideoCall, answerCall, callFailure } = tempSlice.actions

export default tempSlice.reducer