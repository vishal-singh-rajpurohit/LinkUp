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

interface groupsResp {
    _id: string;
    isGroup: boolean;
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
    time: Date;
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
            description: item.description,
            groupName: item.groupName,
            isGroup: item.isGroup,
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
    state.isLoggedIn = false
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
    newChat: groupType
}>) {
    const newContact: groupType = {
        ...action.payload.newChat
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


export const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        enterApp: enterAppFunc,
        logOut: logOutFun,
        saveContact: newContact,
        saveGroup: newGroup,
        blockTrigger: blockFunc
    }
});


export const { enterApp, logOut, saveContact, saveGroup, blockTrigger } = AuthSlice.actions


export default AuthSlice.reducer