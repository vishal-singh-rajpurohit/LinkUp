import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface initialRespType {
    _id: string;
    avatar: string;
    userName: string;
    searchTag: string;
    email: string;
    theme: boolean;
    socketId: string;
    securityQuestion: string;
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
    messages: groupMssageType[];
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

export interface userType {
    _id: string;
    avatar: string;
    userName: string;
    searchTag: string;
    email: string;
    theme: boolean;
    socketId: string;
    question: string;
    answer: string;
    isVerified: boolean;
}

export interface groupMssageType {
    _id: string;
    message: string;
    userId: string;
    hasAttechment: boolean;
    pending: boolean;
    attechmentLink: string;
    attechmentType: string;
    isCall: boolean;
    callType: string;
    createdAt: Date;
    isDeleted?: boolean;
    seen?: boolean,
    sender?: senderTypes;
    readBy: string[];
}

interface senderTypes {
    _id: string;
    searchTag: string;
    avatar: string;
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
    messages?: groupMssageType[];
    members?: groupMemberTypes[];
    unseen?: number;
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
    unseen?: number;
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
    messages: groupMssageType[];
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
        question: "",
        answer: "",
        theme: false,
        isVerified: false
    },
    contacts: [],
    safer: [],
    groups: [],
}

function signFunction(state: initialTypes, action: PayloadAction<{ userData: initialRespType }>) {
    state.user = {
        _id: action.payload.userData._id,
        avatar: action.payload.userData.avatar,
        userName: action.payload.userData.userName,
        email: action.payload.userData.email,
        searchTag: action.payload.userData.searchTag,
        socketId: action.payload.userData.socketId,
        theme: action.payload.userData.theme,
        question: "",
        answer: "",
        isVerified: false
    }
    state.isLoggedIn = true
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
        question: action.payload.userData.securityQuestion,
        answer: "",
        isVerified: false,
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
            messages: item.messages
        }
        console.log(`get contacts: `, item.messages);

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
            messages: item.messages
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
            messages: item.messages
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
        question: "",
        answer: "",
        theme: false,
        isVerified: false
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
    isDeleted: boolean;
    updatedAt: Date;
    messages?: groupMssageType[];
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

    state.contacts = [
        newContact,
        ...(state.contacts)
    ]

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

function setThemeFunc(state: initialTypes) {
    state.user.theme = !state.user.theme;
}

function setTag(state: initialTypes, action: PayloadAction<{ tag: string }>) {
    state.user.searchTag = action.payload.tag
}

function setMail(state: initialTypes, action: PayloadAction<{ mail: string }>) {
    state.user.email = action.payload.mail
}

function setName(state: initialTypes, action: PayloadAction<{ name: string }>) {
    state.user.userName = action.payload.name
}

function setQuestion(state: initialTypes, action: PayloadAction<{ q: string }>) {
    state.user.question = action.payload.q
}

function setAns(state: initialTypes, action: PayloadAction<{ ans: string }>) {
    state.user.answer = action.payload.ans;
    state.user.isVerified = true;
}

function setAvatar(state: initialTypes, action: PayloadAction<{ avatar: string }>) {
    state.user.avatar = action.payload.avatar
}

function setGroupAvatar(state: initialTypes, action: PayloadAction<{ avatar: string; contactId: string; }>) {
    const group = state.groups.filter((gp) => gp._id === action.payload.contactId)[0]

    if (group) {
        group.avatar = action.payload.avatar;
        state.groups = [
            group,
            ...(state.groups.filter((gp) => gp._id !== action.payload.contactId))
        ]
    }

}

// Socket events
function setOnline(state: initialTypes, action: PayloadAction<{ contactId: string; trigger: boolean }>) {
    const contact = state.contacts.filter((user) => user._id === action.payload.contactId);
    if (contact.length) {
        const tempCon = contact[0];
        tempCon.isOnline = action.payload.trigger;
        tempCon.time = new Date()

        state.contacts = [
            tempCon,
            ...(state.contacts.filter((user) => user._id !== action.payload.contactId))
        ]
    }
    else {
        const contact = state.safer.filter((user) => user._id === action.payload.contactId);
        if (contact.length) {
            const tempCon = contact[0];
            tempCon.isOnline = action.payload.trigger;
            tempCon.time = new Date();

            state.safer = [
                ...(state.safer.filter((user) => user._id !== action.payload.contactId)),
                tempCon
            ]
        }
    }

}

function cickOutMember(state: initialTypes, action: PayloadAction<{ newChat: groupsResp }>) {
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

    const toUpdate = state.groups.filter((con) => con._id === action.payload.newChat._id)

    if (toUpdate[0]) {
        console.log(`Update found`);
        toUpdate[0].members = members;
        state.groups = [
            ...(state.groups),
            ...(toUpdate)
        ]
    }

}

function kickedMeOut(state: initialTypes, action: PayloadAction<{ groupId: string }>) {
    state.groups = state.groups.filter((gp) => gp._id !== action.payload.groupId)
}

function newMessage(state: initialTypes, action: PayloadAction<{ newMsg: groupMssageType, contactId: string }>) {
    const toUpdateContact = state.contacts.filter((val) => val._id === action.payload.contactId);
    toUpdateContact[0].lastMessage = action.payload.newMsg.message
    // Checking in groups
    if (toUpdateContact.length) {
        toUpdateContact[0].messages = [
            ...(toUpdateContact[0].messages || []),
            action.payload.newMsg
        ]

        state.contacts = [
            ...(toUpdateContact),
            ...(state.contacts.filter((val) => val._id !== action.payload.contactId)),
        ]
    }
    else {
        const toUpdateContact = state.groups.filter((val) => val._id === action.payload.contactId)
        toUpdateContact[0].lastMessage = action.payload.newMsg.message
        // Checking in groups
        if (toUpdateContact.length) {
            toUpdateContact[0].messages = [
                ...(toUpdateContact[0].messages),
                action.payload.newMsg
            ]

            state.groups = [
                ...(toUpdateContact),
                ...(state.groups.filter((val) => val._id !== action.payload.contactId)),
            ]

        }
        else {
            const toUpdateContact = state.safer.filter((val) => val._id === action.payload.contactId)
            toUpdateContact[0].lastMessage = action.payload.newMsg.message
            // Checking in Archieved
            if (toUpdateContact.length) {
                toUpdateContact[0].messages = [
                    ...(toUpdateContact[0].messages || []),
                    action.payload.newMsg
                ]

                state.contacts = [
                    ...(toUpdateContact),
                    ...(state.safer.filter((val) => val._id !== action.payload.contactId)),
                ]
            }
            else {
                throw new Error('Invalid contact id')
            }
        }
    }

}

function messageMediaSentFunc(state: initialTypes, action: PayloadAction<{ newMsg: groupMssageType, contactId: string }>) {
    const toUpdateContact = state.contacts.filter((val) => val._id === action.payload.contactId);
    // Checking in groups
    if (toUpdateContact.length) {
        const poppedMsgArray = toUpdateContact[0].messages?.filter((val) => val._id !== action.payload.newMsg._id)
        toUpdateContact[0].messages = [
            ...(poppedMsgArray || []),
            action.payload.newMsg
        ]

        state.contacts = [
            ...(toUpdateContact),
            ...(state.contacts.filter((val) => val._id !== action.payload.contactId)),
        ]
    }
    else {
        const toUpdateContact = state.groups.filter((val) => val._id === action.payload.contactId)
        // Checking in groups
        if (toUpdateContact.length) {
            const poppedMsgArray = toUpdateContact[0].messages?.filter((val) => val._id !== action.payload.newMsg._id)

            toUpdateContact[0].messages = [
                ...(poppedMsgArray || []),
                action.payload.newMsg
            ]

            state.groups = [
                ...(toUpdateContact),
                ...(state.groups.filter((val) => val._id !== action.payload.contactId)),
            ]

        }
        else {
            const toUpdateContact = state.safer.filter((val) => val._id === action.payload.contactId)
            // Checking in Archieved
            if (toUpdateContact.length) {
                const poppedMsgArray = toUpdateContact[0].messages?.filter((val) => val._id !== action.payload.newMsg._id)

                toUpdateContact[0].messages = [
                    ...(poppedMsgArray || []),
                    action.payload.newMsg
                ]

                state.contacts = [
                    ...(toUpdateContact),
                    ...(state.safer.filter((val) => val._id !== action.payload.contactId)),
                ]
            }
            else {
                throw new Error('Invalid contact id')
            }
        }
    }

}

function delMessage(state: initialTypes, action: PayloadAction<{ messageId: string; contactId: string; isGroup: boolean }>) {
    if (action.payload.isGroup) {
        const filtered = state.groups.filter((val) => val._id === action.payload.contactId)
        if (filtered.length) {
            const message = filtered[0].messages?.filter((state) => state._id === action.payload.messageId);
            const oldMessage = filtered[0].messages?.filter((state) => state._id !== action.payload.messageId);
            message[0].isDeleted = true;
            filtered[0].messages = [
                ...(oldMessage),
                ...(message)
            ]
            const oldGroups = state.groups.filter((val) => val._id !== action.payload.contactId)

            state.groups = [
                ...(filtered),
                ...(oldGroups)
            ]

        }
    } else {
        const filterdContacts = state.contacts.filter((val) => val._id === action.payload.contactId)
        if (filterdContacts.length) {
            const message = filterdContacts[0].messages?.filter((state) => state._id === action.payload.messageId);
            const oldMessage = filterdContacts[0].messages?.filter((state) => state._id !== action.payload.messageId);
            if (message?.length) {
                message[0].isDeleted = true;
                filterdContacts[0].messages = [
                    ...(oldMessage || []),
                    ...(message || [])
                ]
            }
            const oldContact = state.contacts.filter((val) => val._id !== action.payload.contactId)

            state.contacts = [
                ...(filterdContacts || []),
                ...(oldContact || [])
            ]
        } else {
            const filterdSafer = state.safer.filter((val) => val._id === action.payload.contactId)
            if (filterdSafer.length) {
                const message = filterdSafer[0].messages?.filter((state) => state._id === action.payload.messageId);
                const oldMessage = filterdSafer[0].messages?.filter((state) => state._id !== action.payload.messageId);
                if (message?.length) {
                    message[0].isDeleted = true;
                    filterdSafer[0].messages = [
                        ...(oldMessage || []),
                        ...(message || [])
                    ]
                }
                const oldContact = state.safer.filter((val) => val._id !== action.payload.contactId)

                state.safer = [
                    ...(filterdSafer || []),
                    ...(oldContact || [])
                ]
            } else {
                throw new Error("Contact not found while deleting message")
            }
        }
    }
}

function markRead(state: initialTypes, action: PayloadAction<{
    messageId: string;
    viewerId: string;
    contactId: string;
}>) {
    const isContact = state.contacts.filter((item) => item._id === action.payload.contactId)
    if (isContact.length) {
        const message = isContact[0].messages?.filter((msg) => msg._id === action.payload.messageId)
        if (message?.[0]._id) {
            message[0].readBy = [
                ...(message[0].readBy),
                action.payload.viewerId
            ]
            const index = isContact[0].messages?.indexOf(message[0]);
            if (isContact[0].messages && typeof index === 'number') {
                isContact[0].messages[index] = message[0]
                state.contacts = [
                    ...(state.contacts || []),
                    ...isContact
                ]
            }
        }
    } else {
        const isSafer = state.safer.filter((item) => item._id === action.payload.contactId)
        if (isSafer.length) {
            const message = isSafer[0].messages?.filter((msg) => msg._id === action.payload.messageId)
            if (message?.[0]._id) {
                message[0].readBy = [
                    ...(message[0].readBy),
                    action.payload.viewerId
                ]
                const index = isContact[0].messages?.indexOf(message[0]);
                if (isContact[0].messages && typeof index === 'number') {
                    isContact[0].messages[index] = message[0]
                    state.safer = [
                        ...(state.safer && []),
                        ...isContact
                    ]
                }
            }
        } else {
            const isContact = state.groups.filter((item) => item._id === action.payload.contactId)
            if (isContact.length) {
                const message = isContact[0].messages?.filter((msg) => msg._id === action.payload.messageId)
                if (message?.[0]._id) {
                    message[0].readBy = [
                        ...(message[0].readBy),
                        action.payload.viewerId
                    ]
                    const index = isContact[0].messages?.indexOf(message[0]);
                    if (isContact[0].messages && typeof index === 'number') {
                        isContact[0].messages[index] = message[0]
                        state.groups = [
                            ...(state.groups && []),
                            ...isContact
                        ]
                    }
                }
            }
        }
    }
}

export const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        firstEnter: signFunction,
        enterApp: enterAppFunc,
        logOut: logOutFun,
        saveContact: newContact,
        saveGroup: newGroup,
        blockTrigger: blockFunc,
        addArchieved: archFunc,
        removeArchieved: unArchFunc,
        kickoutAuth: kickoutFunc,
        setTheme: setThemeFunc,
        updateSearchTag: setTag,
        updateEmail: setMail,
        updateName: setName,
        updateAvatar: setAvatar,
        updateGroupAvatar: setGroupAvatar,
        setSecourityQuestion: setQuestion,
        setSecourityAnswer: setAns,
        deleteMessage: delMessage,
        triggerConOnline: setOnline,
        kickOutAuth: cickOutMember,
        kickedMeAuth: kickedMeOut,
        messageRecived: newMessage,
        markAsRead: markRead,
        messageMediaSent: messageMediaSentFunc,
    }
});


export const { firstEnter, enterApp, logOut, saveContact, saveGroup, blockTrigger, addArchieved, removeArchieved, kickoutAuth, setTheme, updateEmail, updateName, updateSearchTag, updateAvatar, setSecourityQuestion, setSecourityAnswer, updateGroupAvatar, deleteMessage, triggerConOnline, kickOutAuth, kickedMeAuth, messageRecived, markAsRead, messageMediaSent } = AuthSlice.actions


export default AuthSlice.reducer