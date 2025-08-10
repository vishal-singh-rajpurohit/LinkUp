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
    safe: newChatTypes[];
    groups: groupsResp[];
}

export interface groupsResp {
    _id: string;
    isGroup: boolean;
    isArchieved: boolean;
    groupName: string;
    avatar: string;
    lastMessage: string;
    whoCanSend: string;
    roomId: string;
    updatedAt: Date;
    description: string;
    members: {
        _id: string;
        isAdmin: boolean;
        user: {
            _id: string;
            userName: string;
            searchTag: string;
            socketId: string;
            email: string;
            avatar: string;
            online: boolean;
        }
    }[]
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
    isArchieved: boolean;
    isGroup?: boolean;
    lastMessage: string;
    isOnline: boolean;
    time?: Date;
    messages?: message[];
    members?: groupMemberTypes[];
}

interface groupMemberTypes {
    _id: string;
    isAdmin: boolean;
    avatar: string;
    searchTag: string;
    userName: string;
    isGroup?: boolean;
    socketId: string;
    email: string;
    isOnline: boolean;
}

export interface groupType {
    _id: string;
    isGroup: boolean;
    isArchieved: boolean;
    groupName: string;
    avatar: string;
    lastMessage: string;
    whoCanSend: string;
    description: string;
    roomId: string;
    time: Date;
    members: groupMemberTypes[];
    messages: message[];
}

interface initialTypes {
    isLoggedIn: boolean;
    user: userType;
    contacts: contactTypes[];
    safer: contactTypes[];
    groups: groupType[];
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
    contacts: [],
    safer: [],
    groups: [],
}

function loginFunction(state: initialTypes, action: PayloadAction<{ userData: initialRespType }>) {
    state.user = {
        _id: action.payload.userData._id,
        avatar: action.payload.userData.avatar,
        userName: action.payload.userData.userName,
        email: action.payload.userData.email,
        searchTag: action.payload.userData.searchTag,
        socketId: action.payload.userData.socketId,
        theme: action.payload.userData.theme,
    }
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
            isArchieved: item.isArchieved,
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

    action.payload.userData.safe.forEach((item) => {
        const newContact: contactTypes = {
            _id: item._id,
            lastMessage: item.lastMessage,
            isBlocked: item.isBlocked,
            roomId: item.socketId,
            time: item.updatedAt,
            userId: item.member.user._id,
            isArchieved: item.isArchieved,
            avatar: item.member.user.avatar,
            socketId: item.member.user.socketId,
            searchTag: item.member.user.searchTag,
            userName: item.member.user.userName,
            email: item.member.user.email,
            isOnline: item.member.user.online,
            messages: []
        }
        state.safer = [...state.safer, newContact]
    })

    action.payload.userData.groups.forEach((item) => {
        const members: groupMemberTypes[] = []
        item.members.forEach((mem) => {
            const newMember: groupMemberTypes = {
                _id: mem.user._id,
                isAdmin: mem.isAdmin,
                avatar: mem.user.avatar,
                email: mem.user.email,
                isOnline: mem.user.online,
                searchTag: mem.user.searchTag,
                socketId: mem.user.socketId,
                userName: mem.user.userName
            }

            members.push(newMember)
        })

        const newContact: groupType = {
            _id: item._id,
            avatar: item.avatar,
            isArchieved: item.isArchieved,
            description: item.description,
            groupName: item.groupName,
            isGroup: true,
            lastMessage: item.lastMessage,
            roomId: item.roomId,
            whoCanSend: item.whoCanSend,
            time: item.updatedAt,
            members: members,
            messages: []
        }

        state.groups = [...state.groups, newContact]
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
    state.isLoggedIn = false;
    state.contacts = [];
    state.groups = [];
    state.safer = []
}


export interface newChatTypes {
    _id: string;
    lastMessage: string;
    socketId: string;
    isBlocked: boolean;
    isArchieved: boolean;
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
        isArchieved: false,
        socketId: action.payload.newChat.member.user.socketId,
        searchTag: action.payload.newChat.member.user.searchTag,
        userName: action.payload.newChat.member.user.userName,
        email: action.payload.newChat.member.user.email,
        isOnline: action.payload.newChat.member.user.online,
        messages: []
    }

    state.contacts = [...state.contacts, newContact]

}

function newGroup(state: initialTypes, action: PayloadAction<{
    newChat: groupsResp
}>) {


    const members: groupMemberTypes[] = []

    action.payload.newChat.members.forEach((mem) => {
        const newMember: groupMemberTypes = {
            _id: mem.user._id,
            isAdmin: mem.isAdmin,
            avatar: mem.user.avatar,
            email: mem.user.email,
            isOnline: mem.user.online,
            searchTag: mem.user.searchTag,
            socketId: mem.user.socketId,
            userName: mem.user.userName
        }

        members.push(newMember)
    })

    const newContact: groupType = {
        _id: action.payload.newChat._id,
        avatar: action.payload.newChat.avatar,
        isArchieved: action.payload.newChat.isArchieved,
        description: action.payload.newChat.description,
        groupName: action.payload.newChat.groupName,
        isGroup: action.payload.newChat.isGroup,
        lastMessage: action.payload.newChat.lastMessage,
        roomId: action.payload.newChat.roomId,
        whoCanSend: action.payload.newChat.whoCanSend,
        time: action.payload.newChat.updatedAt,
        members: members,
        messages: []
    }

    state.groups = [...state.groups, newContact]
}

function blockFunc(state: initialTypes, action: PayloadAction<{ trigger: boolean, id: string, isGroup: boolean }>) {

    if (action.payload.isGroup) {
        state.groups = state.groups.filter((g) => g._id !== action.payload.id)
    } else {
        const tempContact = state.contacts.filter((con) => con._id === action.payload.id)[0]
        tempContact.isBlocked = action.payload.trigger;
        state.contacts = [
            ...(state.contacts && []),
            tempContact
        ]
    }
}

function archFunc(state: initialTypes, action: PayloadAction<{ _id: string }>) {
    const newContact = state.contacts.filter((user) => user._id === action.payload._id)[0];

    if (newContact) {
        state.safer = [
            ...state.safer,
            newContact
        ];

        state.contacts = state.contacts.filter((user) => user._id !== action.payload._id)
    }

}

function unArchFunc(state: initialTypes, action: PayloadAction<{ _id: string }>) {
    const newContact = state.safer.filter((user) => user._id === action.payload._id)[0];

    if (newContact) {
        state.contacts = [
            ...state.contacts,
            newContact
        ];

        state.safer = state.safer.filter((user) => user._id !== action.payload._id)
    }

}


function kickoutFunc(state: initialTypes, action: PayloadAction<{ id: string, conId: string }>) {
    const updatedContact = state.groups.filter((group) => group._id === action.payload.conId)[0];

    const updatedMember = updatedContact.members.filter((member) => member._id !== action.payload.id);

    updatedContact.members = updatedMember;

    state.groups = [...(state.groups.filter((val) => val._id !== action.payload.conId)), updatedContact]
}

export const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        firstEnter: loginFunction,
        enterApp: enterAppFunc,
        logOut: logOutFun,
        saveContact: newContact,
        saveGroup: newGroup,
        blockTrigger: blockFunc,
        addArchieved: archFunc,
        removeArchieved: unArchFunc,
        kickoutAuth: kickoutFunc
    }
});


export const { firstEnter, enterApp, logOut, saveContact, saveGroup, blockTrigger, addArchieved, removeArchieved, kickoutAuth } = AuthSlice.actions


export default AuthSlice.reducer