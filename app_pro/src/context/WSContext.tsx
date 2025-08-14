import React, { createContext, useEffect, useMemo } from "react";
import io from "socket.io-client"
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { kickedMeTemp, triggerOnline } from "../app/functions/temp";
import { kickedMeAuth, kickOutAuth, saveContact, saveGroup, triggerConOnline, type groupMssageType, type groupsResp, type newChatTypes } from "../app/functions/auth";

const ChatEventsEnum = {
    ONLINE_EVENT: "is_online",
    OFFLINE_EVENT: "offline",
    NEW_MESSAGE: "message",
    APPROACHED_TALK: "apprached_to_talk",
    NEW_GROUP_CHAT: "created_room",
    KICKED_OUT_MEMBER: "cickout_member",
    KICKED_OUT_YOU: "you_member"
}

interface WSCTypes {

}


const WSContext = createContext<WSCTypes | null>(null);

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

        socket?.on(ChatEventsEnum.NEW_MESSAGE, ({ newMessage }: { newMessage: groupMssageType; }) => {
            console.log("recived new message: -> ", newMessage);
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
            disp(kickedMeAuth({ groupId }))
            disp(kickedMeTemp({ groupId }))
        })

    }, [socket, isLoggedIn])

    const data = {}
    return <WSContext.Provider value={data} >{children}</WSContext.Provider>

}

export default WSProvider