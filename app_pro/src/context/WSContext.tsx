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
    const remoteStreamRef = useRef<MediaStream>(new MediaStream());

    const attachRemoteToVideo = useCallback((stream: MediaStream | null) => {
        if (!stream || !remoteVideoRef.current) return;
        if (remoteVideoRef.current.srcObject !== stream) {
            remoteVideoRef.current.srcObject = stream;
        }
        remoteVideoRef.current.onloadedmetadata = () => {
            remoteVideoRef.current?.play().catch((err) => {
                console.log("remote play blocked:", err?.message || err);
            });
        };
        remoteVideoRef.current.play().catch((err) => {
            console.log("remote play initial failed:", err?.message || err);
        });
    }, []);

    const attachRemoteFromReceivers = useCallback(() => {
        if (!peer.peer) return;
        const liveTracks = peer.peer
            .getReceivers()
            .map((r) => r.track)
            .filter((t): t is MediaStreamTrack => !!t && t.readyState === "live");
        if (!liveTracks.length) return;
        const stream = new MediaStream(liveTracks);
        setRemoteStream(stream);
        attachRemoteToVideo(stream);
    }, [attachRemoteToVideo]);

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

    const ensureLocalStream = useCallback(async () => {
        if (localStreamRef.current) return localStreamRef.current;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        return stream;
    }, []);

    useEffect(() => {
        if (
            localVideoRef.current &&
            localStreamRef.current &&
            localVideoRef.current.srcObject !== localStreamRef.current
        ) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    });

    const handleIncomingVideoCallPre = useCallback(async (payload: {
        roomId: string;
        callId: string;
        avatar: string;
        remoteUserId: string;
        searchTag: string;
        callerId: string;
        email: string;
    }) => {
        const { roomId, callId, avatar, searchTag, remoteUserId, callerId: callerIdFromServer, email } = payload;
        const targetId = String(remoteUserId || "");
        const normalizedCallerId = String(callerIdFromServer || "");

        // This is the person you need to send signaling to:
        setCallerId(targetId);
        callerIdRef.current = targetId; // IMPORTANT: set ref immediately to avoid races

        const amICaller = normalizedCallerId === String(user._id); // or whatever your backend defines as "callerId"
        console.log("CALL PRE:", { myId: String(user._id), targetId, callerId: normalizedCallerId, amICaller });
        if (!targetId || targetId === String(user._id)) {
            console.warn("Invalid call targetId (self or empty). Check if both tabs are logged into the same account.");
            return;
        }

        disp(setCallDetails({ roomId, callId, avatar, searchTag, callerId: normalizedCallerId, email }));
        disp(setCallingStatus({ status: amICaller ? "OUTGOING" : "INCOMING" }));
    }, [disp, user._id]);

    const answerVideoCall = useCallback(async () => {
        const stream = await ensureLocalStream();
        await addTrack(stream)
        const offer = await peer.createOffer()
        const to = String(callerIdRef.current || "");
        if (!to || to === "[object Object]") return;
        socket?.emit(callEventEnum.MAKE_VIDEO_CALL, { contactId: call.roomId, userId: user._id, to, offer });
    }, [ensureLocalStream, socket, call.roomId, user._id])

    const handleIncomingVideoCall = useCallback(async ({ offer }: { offer: RTCSessionDescription }) => {
        const stream = await ensureLocalStream();
        await addTrack(stream);
        const ans = await peer.getAnswer(offer)

        const to = String(callerIdRef.current || "");
        if (!to || to === "[object Object]") return;
        socket?.emit(callEventEnum.ANSWER_CALL, { to, ans })
        disp(setCallingStatus({ status: "ACTIVE" }));
        nav('/user/call/video')
    }, [ensureLocalStream, socket, nav, disp])

    const handleAnsweredCall = useCallback(async ({ ans }: { ans: RTCSessionDescription }) => {
        await peer.setRemoteDescription(ans)
        disp(setCallingStatus({ status: "ACTIVE" }));
        nav('/user/call/video')
    }, [nav, disp])

    useEffect(() => {
        callerIdRef.current = callerId;
    }, [callerId]);

    const handleCandidateIncoming = useCallback(async ({ candidate }: { candidate: RTCIceCandidate }) => {
        console.log('CANDIDATES INCOMING')
        await peer.addIceCandidate(candidate);
    }, [socket, peer])

    const createAnswer = useCallback(async () => { }, [])
    const denayCall = useCallback(async () => { }, [])

    const clearCall = useCallback(async () => {
        if (!peer.peer) return;
        await peer.resetPeer()
        socket?.emit(callEventEnum.END_CALL, { to: callerIdRef.current })
        nav('/')
    }, [callerIdRef, callerIdRef.current])


    const handleEndCall = useCallback(async () => {
        if (!peer.peer) return;
        await peer.resetPeer()
        nav('/')
    }, [])

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

        socket?.on(callEventEnum.INCOMING_VIDEO_CALL_PRE, handleIncomingVideoCallPre);
        socket?.on(callEventEnum.INCOMING_VIDEO_CALL, handleIncomingVideoCall);
        socket?.on(callEventEnum.CALL_ANSWERED, handleAnsweredCall)
        socket?.on(callEventEnum.ENDED_CALL, handleEndCall)
        socket?.on(callEventEnum.ICE_CANDIDATE_INCOMING, handleCandidateIncoming)

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
            socket?.off(callEventEnum.ENDED_CALL, handleEndCall)

            socket?.disconnect();
        };
    }, [socket, isLoggedIn])

    const handleTracks = useCallback(async (ev: RTCTrackEvent) => {
        console.log("STREAM IS COMING!!!!!")
        const stream = ev.streams?.[0];
        const finalStream = stream ?? (() => {
            remoteStreamRef.current.addTrack(ev.track);
            return new MediaStream(remoteStreamRef.current.getTracks());
        })();

        setRemoteStream(finalStream);
        attachRemoteToVideo(finalStream);
        attachRemoteFromReceivers();
    }, [attachRemoteFromReceivers, attachRemoteToVideo])

    useEffect(() => {
        attachRemoteToVideo(remoteStream);
    }, [remoteStream, attachRemoteToVideo]);

    useEffect(() => {
        peer.peer?.addEventListener("track", handleTracks)
        return () => peer.peer?.removeEventListener("track", handleTracks)
    }, [handleTracks]);

    const handleIceCandidates = useCallback((ev: RTCPeerConnectionIceEvent) => {
        const to = String(callerIdRef.current || "");
        if (ev.candidate && to && to !== "[object Object]") {
            socket?.emit(callEventEnum.ICE_CANDIDATE, { to, candidate: ev.candidate });
        }
    }, [socket]);

    useEffect(() => {
        peer.peer?.addEventListener('icecandidate', handleIceCandidates)
        return () => peer.peer?.removeEventListener('icecandidate', handleIceCandidates)
    }, [handleIceCandidates])

    useEffect(() => {
        const pc = peer.peer;
        if (!pc) return;
        const onConn = () => {
            console.log("PC connectionState:", pc.connectionState);
            if (pc.connectionState === "connected") {
                attachRemoteFromReceivers();
            }
        };
        const onIceConn = () => {
            console.log("PC iceConnectionState:", pc.iceConnectionState);
            if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
                attachRemoteFromReceivers();
            }
        };
        const onSig = () => console.log("PC signalingState:", pc.signalingState);

        const handleNego = () => console.log('handle nego')

        pc.addEventListener("connectionstatechange", onConn);
        pc.addEventListener("iceconnectionstatechange", onIceConn);
        pc.addEventListener("signalingstatechange", onSig);

        pc.addEventListener("negotiationneeded", handleNego)

        return () => {
            pc.removeEventListener("connectionstatechange", onConn);
            pc.removeEventListener("iceconnectionstatechange", onIceConn);
            pc.removeEventListener("signalingstatechange", onSig);
            pc.removeEventListener("negotiationneeded", handleNego)
        };
    }, [attachRemoteFromReceivers]);

    const data: WSCTypes = {
        socket,
        makeACall,
        answerVideoCall,
        denayCall,
        createAnswer,
        clearCall,
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
