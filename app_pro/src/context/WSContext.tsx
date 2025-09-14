import React, { useEffect, useMemo } from "react";
import io from "socket.io-client"
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { callFailure, cancelVideoCall, incomingVideoCall, kickedMeTemp, markTempAsRead, newMessageInRoom, notificationPup, rejectVideoCall, removeTempMessage, requestVideoCall, toggleTyping, triggerOnline, uploadedMeidaTemp } from "../app/functions/temp";
import { deleteMessage, kickedMeAuth, kickOutAuth, markAsRead, messageMediaSent, messageRecived, saveContact, saveGroup, triggerConOnline, type groupMssageType, type groupsResp, type newChatTypes } from "../app/functions/auth";
import { WSContext, type WSCTypes } from "./Contexts";
import { ChatEventsEnum } from "./constant"
import {
    Device,
    types,
    
} from "mediasoup-client"


let device: Device




const WSProvider = ({ children }: { children: React.ReactNode }) => {
    const disp = useAppDispatch();
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
    const user = useAppSelector((state) => state.auth.user)

    // const selectedContact = useAppSelector((state) => state.temp.selectedContact)

    const isIncomingVideoCall = useAppSelector((state) => state.temp.incomingVideoCall)
    const isCalling = useAppSelector((state) => state.temp.isCalling)

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


    const loadDevice = async (routerRtpCapabilities: types.RtpCapabilities) => { 
        try {
            device = new Device()
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error in creating device: ', error)
                throw new Error("Error in creating device")
            }
        }
        await device.load({routerRtpCapabilities})
    }

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

        socket?.on(ChatEventsEnum.APPROACHED_TALK, ({ newContact, userId }: { newContact: newChatTypes, userId: string }) => {
            if(userId === user._id){
                // Publish the media

            }

            disp(saveContact({ newChat: newContact }));
            disp(notificationPup({ trigger: true }))
            // console.log('you are in a chat room , ', newContact);
        })

        socket?.on(ChatEventsEnum.NEW_GROUP_CHAT, ({ newGroupDetails }: { newGroupDetails: groupsResp }) => {
            disp(saveGroup({ newChat: newGroupDetails }));
            disp(notificationPup({ trigger: true }))
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
            console.log('one message is deleted from the group');
            disp(deleteMessage({ contactId, messageId, isGroup }))
            disp(removeTempMessage({ contactId, messageId }))
        })

        socket?.on(ChatEventsEnum.TYPING_ON, ({ avatar }: { avatar: string }) => {
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

        socket?.on(ChatEventsEnum.INCOMING_VIDEO_CALL, ({
            roomId,
            userId,
            searchTag,
            avatar,
            callId,
            mediasoupRouter
        }) => {
            if (!isCalling && !isIncomingVideoCall) {
                if (userId === user._id) {
                    disp(requestVideoCall({ details: { avatar, callId, roomId, searchTag } }))
                    loadDevice(mediasoupRouter)
                    console.log('rtc Capabilities: ', device.rtpCapabilities)
                    // Directly publish the media
                } else {
                    disp(incomingVideoCall({
                        details: {
                            avatar,
                            callId,
                            roomId,
                            searchTag
                        }
                    }))
                }
            }
            // Emit Busy
        })

        socket?.on(ChatEventsEnum.ACCEPTED_VIDEO_CALL, () => {
            console.log("Accepted video call")
            // Logic to implement
        })

        socket?.on(ChatEventsEnum.REJECTED_VIDEO_CALL, () => {
            console.log("Rejected video call")
        })

        socket?.on(ChatEventsEnum.OFFLINE_CALLER, () => {
            disp(callFailure({ trigger: true }))
            disp(rejectVideoCall())
            disp(cancelVideoCall())
        })

        socket?.on(ChatEventsEnum.CANCELLED_VIDEO_CALL, () => {
            disp(callFailure({ trigger: true }))
            disp(cancelVideoCall())
        })

        // socket?.on(ChatEventsEnum.REJECT_VIDEO_CALL, () => {
        //     disp(callFailure({ trigger: true }))
        // })

    }, [socket, isLoggedIn])

    const data: WSCTypes = {
        socket,
        device
    }
    return <WSContext.Provider value={data} >{children}</WSContext.Provider>

}




export default WSProvider