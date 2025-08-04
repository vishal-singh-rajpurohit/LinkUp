import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



export interface initialRespType {
    _id: string;
    avatar: string;
    userName: string;
    searchTag: string;
    email: string;
    theme: boolean;
    socketId: string;
    contacts: newChatTypes[];
}

interface userType {
    _id: string;
    avatar: string;
    userName: string;
    searchTag: string;
    email: string;
    theme: boolean;
    socketId: string;
}

interface message {
    _id: string;
    senderId: string;
    message: string;
    containsFile: boolean;
    fileType: string;
    file: string;
    seen: string;
    isCall: boolean;
    callType: string;
    isCallAccpted: string;
}

export interface contactTypes {
    _id: string;
    userId: string;
    avatar: string;
    roomId: string;
    socketId: string;
    searchTag: string;
    userName: string;
    email: string;
    isBlocked: boolean;
    lastMessage: string;
    isOnline: boolean;
    time: Date;
    messages?: message[];
}

interface initialTypes {
    isLoggedIn: boolean;
    user: userType;
    contacts: contactTypes[]
}

const initialState: initialTypes = {
    isLoggedIn: false,
    user: {
        _id: "",
        avatar: "",
        userName: "",
        email: "",
        searchTag: "",
        socketId: "",
        theme: false,
    },
    contacts: []
}

function enterAppFunc(state: initialTypes, action: PayloadAction<{ userData: initialRespType }>) {
    state.user = {
        _id: action.payload.userData._id,
        avatar: action.payload.userData.avatar,
        userName: action.payload.userData.userName,
        email: action.payload.userData.email,
        searchTag: action.payload.userData.searchTag,
        socketId: action.payload.userData.socketId,
        theme: action.payload.userData.theme,
    }

    action.payload.userData.contacts.forEach((item) => {
        const newContact: contactTypes = {
            _id: item._id,
            lastMessage: item.lastMessage,
            isBlocked: item.isBlocked,
            roomId: item.socketId,
            time: item.updatedAt,
            userId: item.member.user._id,
            avatar: item.member.user.avatar,
            socketId: item.member.user.socketId,
            searchTag: item.member.user.searchTag,
            userName: item.member.user.userName,
            email: item.member.user.email,
            isOnline: item.member.user.online,
            messages: []
        }
        state.contacts = [...state.contacts, newContact]
    })

    state.isLoggedIn = true

}

function logOutFun(state: initialTypes) {
    state.user = {
        _id: "",
        avatar: "",
        userName: "",
        email: "",
        searchTag: "",
        socketId: "",
        theme: false,
    }
    state.isLoggedIn = false
}

export interface newChatTypes {
    _id: string;
    lastMessage: string;
    socketId: string;
    isBlocked: boolean;
    updatedAt: Date;
    messages?: [];
    member: {
        _id: string;
        isArchieved: string;
        socketId: string;
        user: {
            _id: string;
            userName: string;
            searchTag: string;
            socketId: string;
            online: boolean,
            email: string;
            avatar: string;
        }
    };
}
function newContact(state: initialTypes, action: PayloadAction<{
    newChat: newChatTypes
}>) {
    const newContact: contactTypes = {
        _id: action.payload.newChat._id,
        lastMessage: action.payload.newChat.lastMessage,
        isBlocked: action.payload.newChat.isBlocked,
        roomId: action.payload.newChat.socketId,
        time: action.payload.newChat.updatedAt,
        userId: action.payload.newChat.member.user._id,
        avatar: action.payload.newChat.member.user.avatar,
        socketId: action.payload.newChat.member.user.socketId,
        searchTag: action.payload.newChat.member.user.searchTag,
        userName: action.payload.newChat.member.user.userName,
        email: action.payload.newChat.member.user.email,
        isOnline: action.payload.newChat.member.user.online,
        messages: []
    }

    state.contacts = [...state.contacts, newContact]

}


export const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        enterApp: enterAppFunc,
        logOut: logOutFun,
        saveContact: newContact
    }
});


export const { enterApp, logOut, saveContact } = AuthSlice.actions


export default AuthSlice.reducer