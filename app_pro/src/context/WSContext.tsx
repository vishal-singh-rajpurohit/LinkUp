import React, { createContext, useEffect, useMemo } from "react";
import io from "socket.io-client"
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { kickedMeTemp, newMessageInRoom, removeTempMessage, toggleTyping, triggerOnline } from "../app/functions/temp";
import { deleteMessage, kickedMeAuth, kickOutAuth, messageRecived, saveContact, saveGroup, triggerConOnline, type groupMssageType, type groupsResp, type newChatTypes } from "../app/functions/auth";
import type { Socket } from "socket.io-client";

export const ChatEventsEnum = {
    ONLINE_EVENT: "is_online",
    OFFLINE_EVENT: "offline",
    APPROACHED_TALK: "apprached_to_talk",
    NEW_GROUP_CHAT: "created_room",
    KICKED_OUT_MEMBER: "cickout_member",
    KICKED_OUT_YOU: "you_member",
    NEW_MESSAGE: "message",
    MESSAGE_DELETED: "del_message",
    DELETED_MESSAGE: "deleted_message",
    TYPING_ON: 'typing_on',
    TYPING_OFF: 'typing_off',
}

interface WSCTypes {
    socket: Socket | null
}


export const WSContext = createContext<WSCTypes | null>(null);

const WSProvider = ({ children }: { children: React.ReactNode }) => {
    const disp = useAppDispatch();
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
    const selectedContact = useAppSelector((state) => state.temp.selectedContact)


    const socket = useMemo(() => {
        if (isLoggedIn) {
            const newSocket = io(`http://localhost:5000`, {
                autoConnect: true,
                withCredentials: true,
                auth: {
                    token: localStorage.getItem("accessToken"),
                },
            });

            return newSocket
        }
        return null
    }, [isLoggedIn])

    useEffect(() => {
        if (!isLoggedIn) return;
        socket?.connect()
        socket?.on('connect', () => {
            console.log(`connected to the socket`);
        })

        socket?.on(ChatEventsEnum.ONLINE_EVENT, ({ contactId }: { contactId: string; message: string }) => {
            disp(triggerOnline({ contactId: contactId, trigger: true }))
            disp(triggerConOnline({ contactId: contactId, trigger: true }))
        })

        socket?.on(ChatEventsEnum.OFFLINE_EVENT, ({ contactId }: { contactId: string; message: string }) => {
            disp(triggerOnline({ contactId: contactId, trigger: false }))
            disp(triggerConOnline({ contactId: contactId, trigger: false }))
        })

        socket?.on(ChatEventsEnum.APPROACHED_TALK, ({ newContact }: { newContact: newChatTypes }) => {
            disp(saveContact({ newChat: newContact }));
            // console.log('you are in a chat room , ', newContact);
        })

        socket?.on(ChatEventsEnum.NEW_GROUP_CHAT, ({ newGroupDetails }: { newGroupDetails: groupsResp }) => {
            disp(saveGroup({ newChat: newGroupDetails }));
        })

        socket?.on(ChatEventsEnum.KICKED_OUT_MEMBER, ({ updatedGroup }: { updatedGroup: groupsResp }) => {
            console.log('someone kicked');
            disp(kickOutAuth({ newChat: updatedGroup }))
        })

        socket?.on(ChatEventsEnum.KICKED_OUT_YOU, ({ groupId }: { groupId: string }) => {
            console.log('kicked you out');
            // Incomplete
            disp(kickedMeAuth({ groupId }))
            disp(kickedMeTemp({ groupId }))
        })

        socket?.on(ChatEventsEnum.NEW_MESSAGE, ({ newMessage, contactId }: { newMessage: groupMssageType; contactId: string; }) => {
            disp(messageRecived({ contactId: contactId, newMsg: newMessage }));
            disp(newMessageInRoom({ contactId: contactId, newMsg: newMessage }));
        })

        socket?.on(ChatEventsEnum.DELETED_MESSAGE, ({ messageId, contactId, isGroup }: { messageId: string; contactId: string; isGroup: boolean }) => {
            console.log('one message is deleted from the group');
            disp(deleteMessage({ contactId, messageId, isGroup }))
            disp(removeTempMessage({ contactId, messageId }))
        })

        socket?.on(ChatEventsEnum.TYPING_ON, ({ avatar }: { avatar: string }) => {
            disp(toggleTyping({avatar: avatar, trigger: true}))
        })

        socket?.on(ChatEventsEnum.TYPING_OFF, () => {
            disp(toggleTyping({avatar: "", trigger: false}))
        })

    }, [socket, isLoggedIn])

    const data: WSCTypes = {
        socket
    }
    return <WSContext.Provider value={data} >{children}</WSContext.Provider>

}

export default WSProvider