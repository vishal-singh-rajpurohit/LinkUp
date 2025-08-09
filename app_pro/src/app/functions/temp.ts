import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type contactTypes, type groupType } from './auth'

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

interface initialStateTypes {
    searchUsers: searchUserTypes[];
    activeGroup: boolean;
    selectedContact: contactTypes | null;
    groupContact: groupContactTypes[];
    chatListTypes: number; // 1 -> single, 2-> group, 3 -> archieved
}

const initialState: initialStateTypes = {
    searchUsers: [],
    activeGroup: false,
    selectedContact: null,
    groupContact: [],
    chatListTypes: 1
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
        isGroup:  action.payload.chat.isGroup,
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

function clearTemo(state: initialStateTypes){
    state.activeGroup = false;
    state.chatListTypes = 1;
    state.groupContact = [];
    state.searchUsers = [];
    state.selectedContact = null;
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
        clearTemp: clearTemo
    }
})


export const { searching, selectContact, selectGroup, openGroupChat, appendGroupContact, clearGroupContact, appendGroupAdmin, contactListingFunction, blockSelected, clearTemp } = tempSlice.actions

export default tempSlice.reducer