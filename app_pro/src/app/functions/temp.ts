import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type contactTypes } from './auth'

export interface searchUserTypes {
    _id: string;
    searchTag: string;
    avatar: string;
    isOnline: boolean
}

interface initialStateTypes {
    searchUsers: searchUserTypes[];
    selectedContact: contactTypes | null;
}

const initialState: initialStateTypes = {
    searchUsers: [],
    selectedContact: null
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


const tempSlice = createSlice({
    name: 'temp',
    initialState: initialState,
    reducers: {
        searching: searchingFunc,
        selectContact: selectConFunc
    }
})


export const { searching, selectContact } = tempSlice.actions

export default tempSlice.reducer