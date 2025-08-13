import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type contactTypes, type groupType } from './auth'
import { IoAccessibilityOutline } from "react-icons/io5";

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

interface initialStateTypes {
    searchUsers: searchUserTypes[];
    activeGroup: boolean;
    activeAddToGroup: boolean;
    kickOutGroup: boolean;
    kickOutWarning: boolean;
    selectedContact: contactTypes;
    groupContact: groupContactTypes[];
    chatListTypes: number; // 1 -> single, 2-> group, 3 -> archieved
    tempUser: temporalTypes[];
    tempString: string;
    chatStates: chatStates;
}

const initialState: initialStateTypes = {
    searchUsers: [],
    activeGroup: false,
    activeAddToGroup: false,
    kickOutGroup: false,
    kickOutWarning: false,
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
    }
}

function searchingFunc(state: initialStateTypes, action: PayloadAction<{ users: searchUserTypes[] }>) {
    state.searchUsers = action.payload.users
}

function selectConFunc(state: initialStateTypes, action: PayloadAction<{ chat: contactTypes }>) {
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
        messages: [],
        members: action.payload.chat.members
    }
}

function addGroupContact(state: initialStateTypes, action: PayloadAction<{ user: groupContactTypes }>) {
    let find: boolean = false;

    for (let val of state.groupContact) {
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
    }
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

    for (let val of state.tempUser) {
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
        state.selectedContact.time = new Date();
    }
}

// Chat settings

function setHasAttechFunc(state: initialStateTypes, action: PayloadAction<{ trigger: boolean }>) {
    state.chatStates.hasAttechments = action.payload.trigger;
}

function delMessage(state: initialStateTypes, action: PayloadAction<{ messageId: string }>) {
    state.selectedContact.messages = state.selectedContact.messages?.filter((msg) => msg._id !== action.payload.messageId);
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
        triggerOnline: setOnline
    }
})


export const { searching, selectContact, selectGroup, openGroupChat, appendGroupContact, clearGroupContact, appendGroupAdmin, contactListingFunction, blockSelected, clearTemp, setTempUser, setAddGroupModal, setKickoutModal, setKickoutWarning, setTempString, kickoutTemp, updateSelectedAvatar, setHasAttechments, removeTempMessage, triggerOnline } = tempSlice.actions

export default tempSlice.reducer