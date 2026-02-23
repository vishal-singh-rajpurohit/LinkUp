import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client"
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { kickedMeTemp, markTempAsRead, newMessageInRoom, notificationPup, removeTempMessage, toggleTyping, triggerOnline, uploadedMeidaTemp } from "../app/functions/temp";
import { deleteMessage, kickedMeAuth, kickOutAuth, markAsRead, messageMediaSent, messageRecived, saveContact, saveGroup, triggerConOnline, type groupMssageType, type groupsResp, type newChatTypes } from "../app/functions/auth";
import { WSContext, type WSCTypes } from "./Contexts";
import { callEventEnum, ChatEventsEnum } from "./constant"
import { setCallDetails, setCallingStatus } from "../app/functions/call";
import peer from "./PeerPackages"
import { useNavigate } from "react-router-dom";

const SOCKET_API = import.meta.env.VITE_API_;

const WSProvider = ({ children }: { children: React.ReactNode }) => {
    const disp = useAppDispatch();

    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
    const user = useAppSelector((state) => state.auth.user)
    const call = useAppSelector((state) => state.call.callingDet)

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


    const selectedContact = useAppSelector((state) => state.temp.selectedContact);


    const nav = useNavigate()
    // Local Video
    const localStreamRef = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    // Remote Video
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    const [callerId, setCallerId] = useState<string>('')
    const callerIdRef = useRef(callerId);

    const addTrack = async (stream: MediaStream) => {
        if (!peer.peer) return;

        const existingSenders = peer.peer.getSenders().map(s => s.track?.id);
        for (const track of stream.getTracks()) {
            if (!existingSenders.includes(track.id)) {
                peer.peer.addTrack(track, stream);
            }
        }
    }

    const makeACall = useCallback(async () => {
        try {
            socket?.emit(callEventEnum.MAKE_VIDEO_CALL_PRE, { contactId: selectedContact._id, callerId: user._id, username: selectedContact.searchTag, avatar: selectedContact.avatar });

        } catch (error) {
            if (error instanceof Error) {
                throw new Error('Error in make a call function: ' + error.message)
            }
        }
    }, [socket, peer, selectedContact, user, nav])

    useEffect(() => {
        if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current
            console.log('SETTING LOCAL STREAM')
        }
    }, [localStreamRef.current])

    const handleIncomingVideoCallPre = useCallback(async ({
        roomId,
        callId,
        avatar,
        searchTag,
        remoteUserId,
        callerId,
        email,
    }: {
        roomId: string;
        callId: string;
        avatar: string;
        remoteUserId: string;
        searchTag: string;
        callerId: string;
        email: string;
    }) => {
        setCallerId(remoteUserId)
        if (callerId === user._id) {
            disp(setCallingStatus({ status: 'OUTGOING' }));
            disp(setCallDetails({ roomId, callId, avatar, searchTag, callerId, email }))
        } else {
            disp(setCallDetails({ roomId, callId, avatar, searchTag, callerId, email }))
            disp(setCallingStatus({ status: 'INCOMING' }))
        }
    }, [peer, socket, nav, callerId, setCallerId, selectedContact, user])

    const answerVideoCall = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        localStreamRef.current = stream
        await addTrack(stream)
        const offer = await peer.createOffer()

        socket?.emit(callEventEnum.MAKE_VIDEO_CALL, { contactId: call.roomId, userId: user._id, to: callerIdRef.current, offer });
    }, [peer, socket, nav, callerId, setCallerId, call, callerIdRef.current])

    const handleIncomingVideoCall = useCallback(async ({ offer }: { offer: RTCSessionDescription }) => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStreamRef.current = stream;

        const ans = await peer.getAnswer(offer)
        await addTrack(stream);

        socket?.emit(callEventEnum.ANSWER_CALL, { to: callerIdRef.current, ans })
        nav('/user/call/video')
    }, [peer, socket, nav, callerId, setCallerId])

    const handleAnsweredCall = useCallback(async ({ ans }: { ans: RTCSessionDescription }) => {
        await peer.setRemoteDescription(ans)
        nav('/user/call/video')
    }, [peer, localStreamRef.current])

    useEffect(() => {
        callerIdRef.current = callerId;
    }, [callerId]);

    const handleNegotiationIncoming = useCallback(async ({ offer }: { offer: RTCSessionDescription }) => {
        console.log('INCOMING NEGOTIATION')

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        localStreamRef.current = stream
        
        const ans = await peer.getAnswer(offer);
        await addTrack(stream)

        const to = callerIdRef.current;
        socket?.emit(callEventEnum.NEGOTIATION_DONE, { to, ans });
    }, [socket, peer]);

    const handleNegotiationFinal = useCallback(async ({ ans }: { ans: RTCSessionDescription }) => {
        console.log('INCOMING FINAL')
        await peer.setRemoteDescription(ans);
        // await answerVideoCall()
    }, [socket, peer])

    const handleCandidateIncoming = useCallback(async ({ candidate }: { candidate: RTCIceCandidate }) => {
        console.log('CANDIDATES INCOMING')
        await peer.addIceCandidate(candidate);
    }, [socket, peer])

    const clearCallStates = useCallback(async () => { }, [])
    const createAnswer = useCallback(async () => { }, [])
    const denayCall = useCallback(async () => { }, [])

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

        // --------------
        // --------------
        // --------------
        // --------CALLING
        // --------------
        // --------------
        // --------------

        // Pre
        socket?.on(callEventEnum.INCOMING_VIDEO_CALL_PRE, handleIncomingVideoCallPre);
        socket?.on(callEventEnum.INCOMING_VIDEO_CALL, handleIncomingVideoCall);
        socket?.on(callEventEnum.CALL_ANSWERED, handleAnsweredCall)

        socket?.on(callEventEnum.ICE_CANDIDATE_INCOMING, handleCandidateIncoming)
        socket?.on(callEventEnum.NEGOTIATION_INCOMING, handleNegotiationIncoming)
        socket?.on(callEventEnum.NEGOTIATION_FINAL, handleNegotiationFinal)

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

            socket?.off(callEventEnum.INCOMING_VIDEO_CALL_PRE, handleIncomingVideoCallPre);
            socket?.off(callEventEnum.INCOMING_VIDEO_CALL, handleIncomingVideoCall);
            socket?.off(callEventEnum.CALL_ANSWERED, handleAnsweredCall)
            socket?.off(callEventEnum.ICE_CANDIDATE_INCOMING, handleCandidateIncoming)
            socket?.off(callEventEnum.NEGOTIATION_INCOMING, handleNegotiationIncoming)
            socket?.off(callEventEnum.NEGOTIATION_FINAL, handleNegotiationFinal)

            socket?.disconnect();
        };
    }, [socket, isLoggedIn])

    const handleTracks = useCallback(async (ev: RTCTrackEvent) => {
        const stream = ev.streams[0]
        console.log("STREAM IS COMING!!!!!") 
        setRemoteStream(stream)
    }, [setRemoteStream])
 
    useEffect(() => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
        }
    }, [remoteStream]);

    useEffect(() => {
        peer.peer?.addEventListener("track", handleTracks)
        return () => peer.peer?.removeEventListener("track", handleTracks)
    }, [handleTracks]);

    const handleIceCandidates = useCallback(async (ev: RTCPeerConnectionIceEvent) => {
        if (ev.candidate && callerId) {
            console.log('ICE CANDIDATES COMING')
            socket?.emit(callEventEnum.ICE_CANDIDATE, { to: callerId, candidate: ev.candidate })  // callerId is going undefined
        }
    }, [socket, callerId]);

    useEffect(() => {
        peer.peer?.addEventListener('icecandidate', handleIceCandidates)
        return () => peer.peer?.removeEventListener('icecandidate', handleIceCandidates)
    }, [handleIceCandidates])

    const makingOfferRef = useRef(false);

    const handleNegotiationNeeded = useCallback(async () => {
        if (!peer.peer) return;
        if (makingOfferRef.current) return;
        if (peer.peer.signalingState !== "stable") return;

        makingOfferRef.current = true;

        const offer = await peer.createOffer()

        socket?.emit(callEventEnum.NEGOTIATION_NEEDED, { to: callerId, offer })
        makingOfferRef.current = false;
    }, [socket, peer, callerId, setCallerId]);

    useEffect(() => {
        peer.peer?.addEventListener('negotiationneeded', handleNegotiationNeeded)
        return () => peer.peer?.removeEventListener('negotiationneeded', handleNegotiationNeeded)
    }, [handleNegotiationNeeded])

    const data: WSCTypes = {
        socket,
        makeACall,
        answerVideoCall,
        denayCall,
        createAnswer,
        clearCallStates,
        video: {
            localVideoRef,
            remoteVideoRef,
            localStreamRef,
            remoteStream
        }
    }

    return <WSContext.Provider value={data} >{children}</WSContext.Provider>

}

export default WSProvider