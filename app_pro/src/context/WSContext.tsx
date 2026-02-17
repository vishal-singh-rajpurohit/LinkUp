import React, { useEffect, useMemo } from "react";
import io from "socket.io-client"
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { kickedMeTemp, markTempAsRead, newMessageInRoom, notificationPup, removeTempMessage, toggleTyping, triggerOnline, uploadedMeidaTemp } from "../app/functions/temp";
import { deleteMessage, kickedMeAuth, kickOutAuth, markAsRead, messageMediaSent, messageRecived, saveContact, saveGroup, triggerConOnline, type groupMssageType, type groupsResp, type newChatTypes } from "../app/functions/auth";
import { WSContext, type WSCTypes } from "./Contexts";
import { ChatEventsEnum } from "./constant"

const SOCKET_API = import.meta.env.VITE_API_;

const WSProvider = ({ children }: { children: React.ReactNode }) => {
    const disp = useAppDispatch();

    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
    const user = useAppSelector((state) => state.auth.user)

    const socket = useMemo(() => {
        if (isLoggedIn) {
            const newSocket = io(SOCKET_API, {
                autoConnect: true,
                withCredentials: true,
                auth: {
                    token: localStorage.getItem("accessToken"),
                },
            });

            return newSocket
        }
        return null
    }, [isLoggedIn]);

    useEffect(() => {
        if (!isLoggedIn) return;
        socket?.connect()

        socket?.on('connect', () => {
            console.log(`connected to the socket`);
        });

        socket?.on(ChatEventsEnum.ONLINE_EVENT, ({ contactId }: { contactId: string; message: string }) => {
            disp(triggerOnline({ contactId: contactId, trigger: true }))
            disp(triggerConOnline({ contactId: contactId, trigger: true }))
        })

        socket?.on(ChatEventsEnum.OFFLINE_EVENT, ({ contactId }: { contactId: string; message: string }) => {
            disp(triggerOnline({ contactId: contactId, trigger: false }))
            disp(triggerConOnline({ contactId: contactId, trigger: false }))
        })

        socket?.on(ChatEventsEnum.APPROACHED_TALK, ({ newContact, userId }: { newContact: newChatTypes, userId: string }) => {
            if (userId === user._id) {
                // Publish the media

            }

            disp(saveContact({ newChat: newContact }));
            disp(notificationPup({ trigger: true }));
        })

        socket?.on(ChatEventsEnum.NEW_GROUP_CHAT, ({ newGroupDetails }: { newGroupDetails: groupsResp }) => {
            disp(saveGroup({ newChat: newGroupDetails }));
            disp(notificationPup({ trigger: true }))
        })

        socket?.on(ChatEventsEnum.KICKED_OUT_MEMBER, ({ updatedGroup }: { updatedGroup: groupsResp }) => {
            disp(kickOutAuth({ newChat: updatedGroup }))
        })

        socket?.on(ChatEventsEnum.KICKED_OUT_YOU, ({ groupId }: { groupId: string }) => {
            disp(kickedMeAuth({ groupId }))
            disp(kickedMeTemp({ groupId }))
        })

        socket?.on(ChatEventsEnum.NEW_MESSAGE, ({ newMessage, contactId }: { newMessage: groupMssageType; contactId: string; }) => {
            disp(messageRecived({ contactId: contactId, newMsg: newMessage }));
            disp(newMessageInRoom({ contactId: contactId, newMsg: newMessage }));
            disp(notificationPup({ trigger: true }))
        })

        socket?.on(ChatEventsEnum.SENDING_MEDIA, ({ newMessage, contactId }: { newMessage: groupMssageType; contactId: string; }) => {
            disp(messageRecived({ contactId: contactId, newMsg: newMessage }));
            disp(newMessageInRoom({ contactId: contactId, newMsg: newMessage }));
        })

        socket?.on(ChatEventsEnum.SENT_MEDIA, ({ newMessage, contactId }: { newMessage: groupMssageType; contactId: string; }) => {
            disp(messageMediaSent({ contactId: contactId, newMsg: newMessage }));
            disp(uploadedMeidaTemp({ contactId: contactId, newMsg: newMessage }));
            // disp(notificationPup({ trigger: true }))
        })

        socket?.on(ChatEventsEnum.DELETED_MESSAGE, ({ messageId, contactId, isGroup }: { messageId: string; contactId: string; isGroup: boolean }) => {
            disp(deleteMessage({ contactId, messageId, isGroup }))
            disp(removeTempMessage({ contactId, messageId }))
        })

        socket?.on(ChatEventsEnum.TYPING_ON, ({ avatar }: { avatar: string }) => {
            console.log('typing.....')
            disp(toggleTyping({ avatar: avatar, trigger: true }))
        })

        socket?.on(ChatEventsEnum.TYPING_OFF, () => {
            disp(toggleTyping({ avatar: "", trigger: false }))
        })

        socket?.on(ChatEventsEnum.MARKED, async ({ messageId, contactId, viewerId }: {
            messageId: string;
            viewerId: string;
            contactId: string;
        }) => {
            disp(markAsRead({ messageId: messageId, contactId: contactId, viewerId }))
            disp(markTempAsRead({ messageId: messageId, contactId: contactId, viewerId }))
        })

        return () => {
            socket?.off("connect");
            socket?.off(ChatEventsEnum.ONLINE_EVENT);
            socket?.off(ChatEventsEnum.OFFLINE_EVENT);
            socket?.off(ChatEventsEnum.APPROACHED_TALK);
            socket?.off(ChatEventsEnum.NEW_GROUP_CHAT);
            socket?.off(ChatEventsEnum.KICKED_OUT_MEMBER);
            socket?.off(ChatEventsEnum.KICKED_OUT_YOU);
            socket?.off(ChatEventsEnum.NEW_MESSAGE);
            socket?.off(ChatEventsEnum.SENDING_MEDIA);
            socket?.off(ChatEventsEnum.SENT_MEDIA);
            socket?.off(ChatEventsEnum.DELETED_MESSAGE);
            socket?.off(ChatEventsEnum.TYPING_ON);
            socket?.off(ChatEventsEnum.TYPING_OFF);
            socket?.off(ChatEventsEnum.MARKED);
            socket?.disconnect();
        };

    }, [socket, isLoggedIn])

    const data: WSCTypes = {
        socket,
    }

    return <WSContext.Provider value={data} >{children}</WSContext.Provider>

}

export default WSProvider