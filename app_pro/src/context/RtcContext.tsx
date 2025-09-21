import React, { useContext, useEffect, useRef } from "react";
import { RtcContext, WSContext, type RtcTypes } from "./Contexts";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { ChatEventsEnum } from "./constant";
import { callFailure, cancelVideoCall, incomingVideoCall, rejectVideoCall, requestVideoCall } from "../app/functions/temp";
import { setCallDetails, setCalling } from "../app/functions/call";
import { type ConsumerOptions, type RtpCapabilities, type TransportOptions } from "mediasoup-client/types";
import { Device } from 'mediasoup-client'
import type { types } from "mediasoup-client";
import { useNavigate } from "react-router-dom";
import useLocalMedia from "../hooks/useLocalMedia";
import useCallMedia from "../hooks/useCallMedia";

// type EmitAsync = <TResponse>(
//     event: string,
//     payload?: Record<string, unknown>, // or a more specific type
//     timeout?: number
// ) => Promise<TResponse>;




const RtcProvider = ({ children }: { children: React.ReactNode }) => {
    const nav = useNavigate();
    const disp = useAppDispatch();

    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
    const isIncomingVideoCall = useAppSelector((state) => state.temp.incomingVideoCall)
    const isCalling = useAppSelector((state) => state.temp.isCalling)
    const user = useAppSelector((state) => state.auth.user)
    const callDet = useAppSelector((state) => state.call.callingDet)

    const { localStream, getAndSetLocalStream, params } = useLocalMedia()

    const rtpCapabilitiesRef = useRef<RtpCapabilities | null>(null);
    const consumerRef = useRef<types.Consumer | null>(null);
    const deviceRef = useRef<types.Device | null>(null)
    const producerTransportRef = useRef<types.Transport<types.AppData> | null>(null);
    const consumerTransportRef = useRef<types.Transport<types.AppData> | null>(null);
    const producerRef = useRef<types.Producer | null>(null);

    const { addTrack } = useCallMedia();
    const SocketContext = useContext(WSContext);


    const emitAsync = function <TResponse>(
        event: string,
        payload?: Record<string, unknown>,
        timeout = 10000
    ): Promise<TResponse> {
        return new Promise((resolve, reject) => {
            if (!socket) return reject(new Error("Socket not initialized"));

            let called = false;

            socket.emit(event, payload, (res: unknown) => {
                if (called) return;
                called = true;
                resolve(res as TResponse);
            });

            setTimeout(() => {
                if (called) return;
                called = true;
                reject(new Error(`${event} ack timeout after ${timeout}ms`));
            }, timeout);
        });
    };

    const setRtpCapabilities = (value: RtpCapabilities) => {
        rtpCapabilitiesRef.current = value;
    }

    const loadDevice = async (rtpCapabilities: RtpCapabilities) => {
        console.log("load device called")
        try {
            deviceRef.current = new Device()
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error in creating device: ', error)
                throw new Error("Error in creating device")
            }
        }
        await deviceRef.current?.load({ routerRtpCapabilities: rtpCapabilities })
        console.log('device rtp capabilities: ', deviceRef.current?.rtpCapabilities)
    }


    // setting local video to the call
    useEffect(() => {
        if (isCalling && localStream) {
            addTrack(localStream.getVideoTracks()[0], {
                avatar: user.avatar,
                callerId: user._id,
                callerName: user.searchTag,
                callId: ""
            })
        }
    }, [localStream, isCalling])

    interface paramsTypes extends TransportOptions {
        error?: Error | string;
    }

    const createSendTransport = async () => {
        console.log("createSendTransport called ")
        // socket?.emit(ChatEventsEnum.CREATE_WEB_RTC_TRANSPORT, { sender: true }, async ({ params }: {
        //     params: paramsTypes;
        // }) => {
        //     if (params.error) {
        //         console.log("Parameter error: ")
        //     }

        //     console.log("CREATE_WEB_RTC_TRANSPORT params: ", params)

        //     // at this point producer will have the access of the videoTrack and params
        //     if (deviceRef.current) {

        //         producerTransportRef.current = deviceRef.current.createSendTransport(params)

        //         producerTransportRef.current?.on('connect', async ({ dtlsParameters }, callback, errorback) => {
        //             console.log("the producer connected: ", dtlsParameters)
        //             try {
        //                 // Signal Local DTLS parameters to the server and producer transport id
        //                 await socket.emit(ChatEventsEnum.TRANSPORT_CONNECT, ({
        //                     dtlsParameters: dtlsParameters
        //                 }));

        //                 callback()
        //             } catch (error) {
        //                 if (error instanceof Error) {
        //                     console.log('error in connecting to dtls')
        //                     errorback(error)
        //                 }
        //             }
        //         })

        //         producerTransportRef.current?.on('produce', async (parameters, callback, errorback) => {

        //             try {
        //                 await socket.emit(ChatEventsEnum.TRANSPORT_PRODUCE, {
        //                     transportId: producerTransportRef.current?.id,
        //                     kind: parameters.kind,
        //                     rtpParameters: parameters.rtpParameters,
        //                     appData: parameters.appData,
        //                     userId: user._id
        //                 }, ({ id }: { id: string }) => {
        //                     callback({ id })
        //                 })
        //             } catch (error) {
        //                 if (error instanceof Error) {
        //                     console.log("Error in produce transport: ")
        //                     errorback(error)
        //                 }
        //             }
        //         })

        //         console.log('create_web_rtc_transport');

        //         await connectSendTransport()
        //     }
        // })

        try {
            const resp = await emitAsync<{ params: paramsTypes }>(ChatEventsEnum.CREATE_WEB_RTC_TRANSPORT, { sender: true })

            const { params } = resp

            if (params.error) {
                console.log("Parameter error: ")
            }

            console.log("CREATE_WEB_RTC_TRANSPORT params: ", params)

            // at this point producer will have the access of the videoTrack and params
            if (deviceRef.current) {

                producerTransportRef.current = deviceRef.current.createSendTransport(params)

                producerTransportRef.current?.on('connect', async ({ dtlsParameters }, callback, errorback) => {
                    console.log("the producer connected: ", dtlsParameters)
                    try {
                        // Signal Local DTLS parameters to the server and producer transport id
                        // await socket?.emit(ChatEventsEnum.TRANSPORT_CONNECT, ({
                        //     dtlsParameters: dtlsParameters
                        // }));
                        await emitAsync<null>(ChatEventsEnum.TRANSPORT_CONNECT, { dtlsParameters: dtlsParameters })

                        callback()
                    } catch (error) {
                        if (error instanceof Error) {
                            console.log('error in connecting to dtls')
                            errorback(error)
                        }
                    }
                })

                producerTransportRef.current?.on('produce', async (parameters, callback, errorback) => {
                    try {
                        // await socket?.emit(ChatEventsEnum.TRANSPORT_PRODUCE, {
                        //     transportId: producerTransportRef.current?.id,
                        //     kind: parameters.kind,
                        //     rtpParameters: parameters.rtpParameters,
                        //     appData: parameters.appData,
                        //     userId: user._id
                        // }, ({ id }: { id: string }) => {
                        //     callback({ id })
                        // })
                        const resp = await emitAsync<{ id: string }>(ChatEventsEnum.TRANSPORT_PRODUCE, {
                            transportId: producerTransportRef.current?.id,
                            kind: parameters.kind,
                            rtpParameters: parameters.rtpParameters,
                            appData: parameters.appData,
                            userId: user._id
                        })

                        callback({ id: resp.id })

                    } catch (error) {
                        if (error instanceof Error) {
                            console.log("Error in produce transport: ")
                            errorback(error)
                        }
                    }
                })

                console.log('create_web_rtc_transport');

                await connectSendTransport()
            }
        } catch (error) {
            console.log("Error in CreateSendTransport: ", error)
        }
    }

    const connectSendTransport = async () => {

        if (producerTransportRef.current) {

            if (!params.current.track) {
                console.error("No track available to produce");
                return;
            }

            producerRef.current = await producerTransportRef.current.produce(params.current)

            producerRef.current.on("trackended", () => {
                console.log("track ended")
                // close the video track
            })

            producerRef.current.on("transportclose", () => {
                console.log("track closed")
            })

            console.log('ProducerTransport Produce');
        }
    }

    const createReciverTransport = async () => {
        // await socket?.emit(ChatEventsEnum.CREATE_WEB_RTC_TRANSPORT, { sender: false }, async ({ params }: { params: paramsTypes }) => {
        //     if (params.error) {
        //         console.log("error in creating consumer transport", params.error)
        //         return;
        //     }

        //     if (deviceRef.current) {

        //         consumerTransportRef.current = deviceRef.current.createRecvTransport(params)

        //         consumerTransportRef.current?.on('connect', async ({ dtlsParameters }, callback, errorback) => {
        //             try {
        //                 await socket.emit(ChatEventsEnum.TRANSPORT_RECIVER_CONNECT, {
        //                     dtlsParameters
        //                 })
        //                 callback()
        //                 console.log("Reciver transport called")
        //             } catch (error) {
        //                 if (error instanceof Error) {
        //                     errorback(error)
        //                 }
        //             }
        //         })

        //         await connectReciverTransport();

        //     }
        // });

        const resp = await emitAsync<{ params: paramsTypes }>(ChatEventsEnum.CREATE_WEB_RTC_TRANSPORT, { sender: false });
        const { params } = resp

        if (params.error) {
            console.log("error in creating consumer transport", params.error)
            return;
        }

        if (deviceRef.current) {

            consumerTransportRef.current = deviceRef.current.createRecvTransport(params)

            consumerTransportRef.current?.on('connect', async ({ dtlsParameters }, callback, errorback) => {
                try {
                    // await socket.emit(ChatEventsEnum.TRANSPORT_RECIVER_CONNECT, {
                    //     dtlsParameters
                    // })
                    await emitAsync<null>(ChatEventsEnum.TRANSPORT_RECIVER_CONNECT, { dtlsParameters })
                    callback()
                    console.log("Reciver transport called")
                } catch (error) {
                    if (error instanceof Error) {
                        errorback(error)
                    }
                }
            })
        }
    }

    interface paramsTypes2 extends ConsumerOptions<types.AppData> {
        error?: Error | string;
    }

    const connectReciverTransport = async () => {
        console.log('connect reciver called');

        // await socket?.emit(ChatEventsEnum.CONSUME, {
        //     rtpCapabilities: deviceRef.current?.rtpCapabilities,
        //     userId: user._id,
        //     callerId: callDet.callerId
        // }, async ({ params }: { params: paramsTypes2 }) => {
        //     if (params.error) {
        //         console.log("Error in connecting the consumer: ", params.error)
        //         return;
        //     }

        //     if (consumerTransportRef.current) {
        //         consumerRef.current = await consumerTransportRef.current.consume({
        //             id: params.id,
        //             producerId: params.producerId,
        //             kind: params.kind,
        //             rtpParameters: params.rtpParameters
        //         })

        //         const { track } = consumerRef.current;

        //         addTrack(track, { avatar: "", callerId: "", callerName: "", callId: "" })

        //         console.log("CONSUME called")

        //         socket.emit(ChatEventsEnum.ON_CONSUMER_RESUME, {})
        //     }

        // })

        const resp = await emitAsync<{ params: paramsTypes2 }>(ChatEventsEnum.CONSUME, {
            rtpCapabilities: deviceRef.current?.rtpCapabilities,
            userId: user._id,
            callerId: callDet.callerId
        })

        const {params} = resp

         if (params.error) {
                console.log("Error in connecting the consumer: ", params.error)
                return;
            }

            if (consumerTransportRef.current) {
                consumerRef.current = await consumerTransportRef.current.consume({
                    id: params.id,
                    producerId: params.producerId,
                    kind: params.kind,
                    rtpParameters: params.rtpParameters
                })

                const { track } = consumerRef.current;

                addTrack(track, { avatar: "", callerId: "", callerName: "", callId: "" })

                console.log("CONSUME called")


                // socket.emit(ChatEventsEnum.ON_CONSUMER_RESUME, {})

                await emitAsync<null>(ChatEventsEnum.ON_CONSUMER_RESUME, {});
            }
    }

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
            callId
        }: {
            roomId: string;
            callerId: string;
            searchTag: string;
            avatar: string;
            callId: string;
        }) {
            disp(setCallDetails({
                avatar,
                callerId,
                callId,
                roomId,
                searchTag
            }));
            if (!isCalling && !isIncomingVideoCall) {
                console.log("INCOMING_VIDEO_CALL: ")

                if (callerId === user._id) {
                    console.log('You are the caller: ', searchTag)
                    disp(setCalling({ trigger: true }))
                    await getAndSetLocalStream();
                    disp(requestVideoCall({
                        details: {
                            avatar,
                            callId,
                            roomId,
                            searchTag
                        }
                    }));

                    socket?.emit(ChatEventsEnum.ANSWER_VIDEO_CALL,
                        {
                            roomId: roomId,
                            callId: callId,
                            avatar: user.avatar,
                            searchTag: searchTag,
                            callerId: callerId,
                        },
                        async (data: { rtpCapabilities: RtpCapabilities }) => {
                            console.log("rtpCapabilities recived: ", data.rtpCapabilities)
                            rtpCapabilitiesRef.current = data.rtpCapabilities;
                            await loadDevice(data.rtpCapabilities);
                            console.log("the device locaded")
                            await createSendTransport();
                            await createReciverTransport();
                            await connectReciverTransport();
                        })
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
        }

        socket?.on(ChatEventsEnum.INCOMING_VIDEO_CALL, handleIncomingCall);

        socket?.on(ChatEventsEnum.ACCEPTED_VIDEO_CALL, ({
            // callId,
            callerId,
            // avatar,
            // searchTag,
            // stream
        }) => {
            console.log('CALL ACCEPTED: ')
            if (user._id === callerId && localStream) {
                nav('/user/call/video')
            } else {
                console.warn('Local stream not ready, cannot navigate yet');
            }

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
        //     disp(callFailure({trigger: true }))
        // })

        return () => {
            socket?.off(ChatEventsEnum.INCOMING_VIDEO_CALL, handleIncomingCall);
        }
    }, [socket, isLoggedIn])

    const data: RtcTypes = {
        deviceRef,
        loadDevice,
        setRtpCapabilities,
        createSendTransport,
        connectSendTransport,
        createReciverTransport,
        connectReciverTransport,
    }

    return <RtcContext.Provider value={data}>{children}</RtcContext.Provider>
}

export default RtcProvider;