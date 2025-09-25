import React, { useContext, useEffect } from "react";
import { RtcContext, WSContext, type RtcTypes } from "./Contexts";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { CallEventEnum, ChatEventsEnum } from "./constant";
import { setCallDetails, setMemberCount, setCallingStatus } from "../app/functions/call";
import { useNavigate } from "react-router-dom";
// import { store } from "../app/store";
import { types } from "mediasoup-client";
import useLocalMedia from "../hooks/useLocalMedia";
import useCallMedia from "../hooks/useCallMedia";
import type { Producer } from "mediasoup-client/types";

const RtcProvider = ({ children }: { children: React.ReactNode }) => {
    const nav = useNavigate();
    const disp = useAppDispatch();

    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
    const callStatus = useAppSelector((state) => state.call.callStatus)
    const user = useAppSelector((state) => state.auth.user)
    const callDet = useAppSelector((state)=>state.call.callingDet)
    // const callerCount = useAppSelector((state)=>state.call.memberCount)

    const { setLRtpCapabilities, getLocalMediaAndProduce, lRtpCapabilities, createDevice, device, sendTransport, recvTransport, audioProducer, videoProducer } = useLocalMedia();

    const { consumers, setRemoteStream } = useCallMedia()

    const SocketContext = useContext(WSContext);
    if (!SocketContext) {
        throw new Error("Socket not found");
    }

    const { socket } = SocketContext;

    useEffect(() => {
        if (!isLoggedIn) return;

        async function handleIncomingCall({
            roomId,
            callerId,
            searchTag,
            avatar,
            callId,
            email
        }: {
            roomId: string;
            callerId: string;
            searchTag: string;
            avatar: string;
            callId: string;
            email: string;
            userId: string;
        }) {
            if (callStatus === "ENDED" || callStatus === "OFF") {
                disp(setCallDetails({
                    avatar,
                    callerId,
                    callId,
                    roomId,
                    searchTag,
                    email
                }));

                disp(setCallingStatus({ status: "INCOMING" }));
            }
        }

        interface createParams extends types.TransportOptions {
            isSender: boolean;
        }

        async function createWebRtcTransport(callId: string, callerId: string) {
            if (!lRtpCapabilities) return;

            // SENDER TRANSPORT
            socket?.emit(CallEventEnum.CREATE_WEB_RTC_TRANSPORT, { sender: true, callId, userId: user._id, callerId });

            socket?.once(CallEventEnum.CREATED_WEB_RTC_TRANSPORT, async (params: createParams) => {
                if (params.isSender) {
                    if (!device.current) return;
                    sendTransport.current = device.current.createSendTransport(params)

                    // CONNECTING THE TRANSPORT
                    sendTransport.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
                        socket.emit(CallEventEnum.CONNECT_TRANSPORT, { callId, callerId, userId: user._id, transportId: params.id, dtlsParameters });

                        socket.on(CallEventEnum.CONNECTED_TRANSPORT, ({ transportId }) => {
                            if (transportId === params.id) callback()
                        })
                        socket?.on('error', errback);
                    })

                    sendTransport.current.on('produce', async ({ appData, kind, rtpParameters }, callback, errback) => {
                        socket.emit(CallEventEnum.PRODUCE, { appData, kind, rtpParameters, callId, userId: user._id, callerId })

                        socket.on(CallEventEnum.PRODUCER_CREATED, ({ producerId }) => {
                            callback({ id: producerId })
                        })

                        socket.on('error', errback)
                    })

                    await getLocalMediaAndProduce()
                }
            })

            //  RECIVER TRANSPORT
            socket?.emit(CallEventEnum.CREATE_WEB_RTC_TRANSPORT, { sender: false, callId, userId: user._id, callerId });

            socket?.once(CallEventEnum.CREATED_WEB_RTC_TRANSPORT, async (params: createParams) => {
                if (!params.isSender) {
                    if (!device.current) return;
                    recvTransport.current = device.current.createRecvTransport(params)

                    // CONNECTING THE TRANSPORT
                    recvTransport.current.on('connect', async ({ dtlsParameters }, callback, errback) => {
                        socket.emit(CallEventEnum.CONNECT_TRANSPORT, { callId, callerId, userId: user._id, transportId: params.id, dtlsParameters });

                        socket.on(CallEventEnum.CONNECTED_TRANSPORT, ({ transportId }) => {
                            if (transportId === params.id) callback()
                        })
                        socket?.once('error', errback);
                    })

                    sendTransport.current?.on('produce', async ({ appData, kind, rtpParameters }, callback, errback) => {
                        socket.emit(CallEventEnum.PRODUCE, { appData, kind, rtpParameters, callId, userId: user._id, callerId })

                        socket.on(CallEventEnum.PRODUCER_CREATED, ({ producerId }) => {
                            callback({ id: producerId })
                        })

                        socket.once('error', errback)
                    })
                }
            })
        }

        async function onRequestedVideoCall({
            roomId,
            callerId,
            searchTag,
            avatar,
            callId,
        }: {
            roomId: string;
            callerId: string;
            searchTag: string;
            avatar: string;
            callId: string;

        }) {
            if (callerId === user._id) {
                disp(setCallDetails({
                    avatar,
                    callerId,
                    callId,
                    roomId,
                    searchTag,
                    email: user.email
                }));

                disp(setCallingStatus({ status: "OUTGOING" }))
                disp(setMemberCount({ type: 'INC' }))

                socket?.emit(CallEventEnum.ANSWER_VIDEO_CALL,
                    { callerId, callId, userId: user._id },
                    async (rtpCapabilities: types.RtpCapabilities) => {
                        setLRtpCapabilities(rtpCapabilities)
                    })
            }
        }

        async function onAcceptedVideoCall({
            roomId,
            callerId,
            searchTag,
            avatar,
            callId,
            userId
        }: {
            roomId: string;
            callerId: string;
            searchTag: string;
            avatar: string;
            callId: string;
            userId: string;
        }) {
            if (userId === user._id) {
                await createDevice()
                await createWebRtcTransport(callId, callerId)
            }
        }

        async function onNewProducer({ userId, searchTag, callId, producerId }: { userId: string; searchTag: string; callId: string; producerId: string; }) {
            if (!recvTransport.current || !device.current || !device.current.loaded) return;

            if (userId === user._id) return;

            try {
                socket?.emit(CallEventEnum.CONSUME, {
                    callId,
                    producerId: producerId,
                    rtpCapabilities: device.current.rtpCapabilities,
                    remoteUserId: userId,
                    remoteUserName: searchTag
                });
            } catch (error) {
                console.log("Error in getting new producer: ", error)
            }
        }

        async function onConsumerCreated({
            consumerId,
            producerId,
            paused,
            kind,
            rtpParameters,
            callerId,
            callId,
            searchTag,
            userId
        }: {
            consumerId: string;
            producerId: string;
            paused: boolean;
            kind: types.MediaKind;
            rtpParameters: types.RtpParameters;
            callerId: string;
            callId: string;
            userId: string;
            searchTag: string;
        }) {
            const consumer = await recvTransport.current?.consume({
                id: consumerId,
                rtpParameters: rtpParameters,
                kind,
                producerId,
            });

            if (!consumer) return;

            consumers.current.set(consumer.id, consumer);
            consumer.appData.userId = userId;
            consumer.appData.userName = searchTag;

            setRemoteStream(prev => {
                let existingUserStreamIndex: number;
                if (!prev) {
                    existingUserStreamIndex = -1;
                }
                existingUserStreamIndex = prev.findIndex(s => s.userId === userId);

                if (existingUserStreamIndex > -1) {
                    // Update existing stream with new track (e.g., add video if audio-only before)
                    const updatedStreams = [...prev];
                    updatedStreams[existingUserStreamIndex].stream.addTrack(consumer.track);
                    updatedStreams[existingUserStreamIndex].producerId = producerId; // Keep track of the latest producerId
                    updatedStreams[existingUserStreamIndex].isPaused = paused;
                    return updatedStreams;
                }
                else {
                    const newStream = new MediaStream([consumer.track]);

                    return [...prev, {
                        producerId: producerId, // Initial producerId for this stream
                        userId: userId,
                        userName: searchTag,
                        stream: newStream,
                        kind: kind,
                        isPaused: paused
                    }];
                }
            });
            consumer.on('trackended', () => {
                console.log('Track ended for consumer:', consumer.id);
                // Handle UI cleanup or re-negotiation for this specific track
            });
            consumer.on('transportclose', () => {
                console.log('Consumer transport closed:', consumer.id);
                // Handle UI cleanup
            });
        }

        async function onProducerClosed({ producerId }: { producerId: string; }) {
            const consumer = consumers.current.get(producerId);

            if (consumer) {
                consumer.pause()
                consumers.current.delete(producerId);
                setRemoteStream(prev => prev.filter(s => s.producerId !== producerId))
            }
        }

        async function onProducerStateChanged({ producerId, paused }: { producerId: string; paused: boolean }) {
            const consumer = consumers.current.get(producerId)

            if (consumer) {
                if (paused) {
                    consumer.pause()
                } else {
                    consumer.resume()
                }

                setRemoteStream(prev => prev.map((s) =>
                    s.producerId === producerId ? { ...s, isPaused: paused } : s
                ));
            }
        }

        async function onCallError({ message }: { message: string }) {
            console.log("Error => ", message)
        }

        socket?.on(CallEventEnum.INCOMING_VIDEO_CALL, handleIncomingCall);

        socket?.on(CallEventEnum.REQUESTED_VIDEO_CALL, onRequestedVideoCall);

        socket?.on(CallEventEnum.ACCEPTED_VIDEO_CALL, onAcceptedVideoCall);

        socket?.on(CallEventEnum.NEW_PRODUCER, onNewProducer)

        socket?.on(CallEventEnum.PRODUCER_CREATED, onConsumerCreated)

        socket?.on(CallEventEnum.PRODUCER_STATE_CHANGED, onProducerStateChanged)

        socket?.on(CallEventEnum.PRODUCER_CLOSED, onProducerClosed)

        socket?.on(CallEventEnum.CALL_EVENT_ERROR, onCallError)

        return () => {
            socket?.off(CallEventEnum.INCOMING_VIDEO_CALL, handleIncomingCall);

            socket?.off(CallEventEnum.REQUESTED_VIDEO_CALL, onRequestedVideoCall);

            socket?.off(CallEventEnum.ACCEPTED_VIDEO_CALL, onAcceptedVideoCall);

            socket?.off(CallEventEnum.NEW_PRODUCER, onNewProducer)

            socket?.off(CallEventEnum.PRODUCER_CREATED, onConsumerCreated)

            socket?.off(CallEventEnum.PRODUCER_STATE_CHANGED, onProducerStateChanged)

            socket?.off(CallEventEnum.PRODUCER_CLOSED, onProducerClosed)

            socket?.off(CallEventEnum.CALL_EVENT_ERROR, onCallError)
        }
    }, [socket, isLoggedIn])

    const toggleLocalMedia = async (kind: types.MediaKind) => {
        if (!socket) return;

        let producer: Producer | null = null;

        if (kind === 'audio') producer = audioProducer.current;
        if (kind === 'video') producer = videoProducer.current;

        if (producer) {
            const action = producer.paused ? 'resume' : 'pause';
            if (action === 'pause') {
                await producer.pause();
            } else {
                await producer.resume();
            }

            // Notify server about the state change
            socket.emit(ChatEventsEnum.ON_CONSUMER_RESUME, {
                callId: callDet.callId,
                producerId: producer.id,
                action: action // 'pause' or 'resume'
            });
        }
    }

    useEffect(() => {
        if (callStatus === "ACTIVE") {
            nav("/user/call/video")
        }
    }, [callStatus]);

    const data: RtcTypes = {
        toggleLocalMedia
    }


    return <RtcContext.Provider value={data}>{children}</RtcContext.Provider>
}

export default RtcProvider;