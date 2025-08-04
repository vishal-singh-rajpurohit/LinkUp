import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



export interface initialRespType {
    _id: string;
    avatar: string;
    userName: string;
    searchTag: string;
    email: string;
    theme: boolean;
    socketId: string;
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

interface contact {
    _id: string;
    avatar: string;
    searchTag: string;
    lastMessage: string;
    isOnline: boolean;
    time: string;
    messages: message[];
}

interface initialTypes {
    isLoggedIn: boolean;
    user: userType;
    contacts: contact[]
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


export const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        enterApp: enterAppFunc,
        logOut: logOutFun
    }
});


export const { enterApp, logOut } = AuthSlice.actions


export default AuthSlice.reducer