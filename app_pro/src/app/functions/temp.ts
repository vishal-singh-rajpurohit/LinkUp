import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type contactTypes } from './auth'

export interface searchUserTypes {
    _id: string;
    searchTag: string;
    avatar: string;
    isOnline: boolean
}


export interface groupContactTypes {
    _id: string,
    searchTag: string,
    avatar: string,
    admin?: boolean
}

interface initialStateTypes {
    searchUsers: searchUserTypes[];
    selectedContact: contactTypes | null;
    groupContact: groupContactTypes[];
}

const initialState: initialStateTypes = {
    searchUsers: [],
    selectedContact: null,
    groupContact: []
}

function searchingFunc(state: initialStateTypes, action: PayloadAction<{ users: searchUserTypes[] }>) {
    state.searchUsers = action.payload.users
}


function selectConFunc(state: initialStateTypes, action: PayloadAction<{ chat: contactTypes }>) {
    state.selectedContact = {
        _id: action.payload.chat._id,
        lastMessage: action.payload.chat.lastMessage,
        isBlocked: action.payload.chat.isBlocked,
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

    console.log(`filtered user: ${JSON.stringify(user, null, 2)}`);

    if (!user[0].admin) {
        user[0].admin = true
        const prevUser = state.groupContact.filter((val) => val._id !== action.payload.user._id)
        state.groupContact = [...prevUser, user[0]]
    } else if (user[0].admin) {
        user[0].admin = false
        const prevUser = state.groupContact.filter((val) => val._id !== action.payload.user._id)
        state.groupContact = [...prevUser, user[0]]
    }

    console.log(`filtered user: ${JSON.stringify(state.groupContact, null, 2)}`);
}

function clearGroupCon(state: initialStateTypes) {
    state.groupContact = []
}


const tempSlice = createSlice({
    name: 'temp',
    initialState: initialState,
    reducers: {
        searching: searchingFunc,
        selectContact: selectConFunc,
        appendGroupContact: addGroupContact,
        appendGroupAdmin: addGroupAdmin,
        clearGroupContact: clearGroupCon
    }
})


export const { searching, selectContact, appendGroupContact, clearGroupContact, appendGroupAdmin } = tempSlice.actions

export default tempSlice.reducer