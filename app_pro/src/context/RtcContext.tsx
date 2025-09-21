import React, { useContext, useEffect } from "react";
import { RtcContext, WSContext } from "./Contexts";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { ChatEventsEnum } from "./constant";
import { incomingVideoCall, requestVideoCall, setIncomingCallState } from "../app/functions/temp";
import { pickUpCall, setCallDetails, setMemberCount } from "../app/functions/call";
import { useNavigate } from "react-router-dom";
import { store } from "../app/store";

const RtcProvider = ({ children }: { children: React.ReactNode }) => {
    const nav = useNavigate();
    const disp = useAppDispatch();

    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
    const isIncomingVideoCall = useAppSelector((state) => state.temp.incomingVideoCall)
    const isCalling = useAppSelector((state) => state.call.isCalling)
    const isIncomingCalling = useAppSelector((state) => state.temp.incomingVideoCall)
    const user = useAppSelector((state) => state.auth.user)
    // const callerCount = useAppSelector((state)=>state.call.memberCount)
    const isAnswered = useAppSelector((state) => state.call.isAnswered)


    const SocketContext = useContext(WSContext);



    if (!SocketContext) {
        throw new Error("Socket not found");
    }

    const { socket } = SocketContext;

    useEffect(() => {
        if (!isLoggedIn) return;

        async function handleIncomingCallTest({
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
        }) {
            if (!isCalling && !isIncomingVideoCall && !isIncomingCalling) {
                console.log("INCOMING_VIDEO_CALL: ", callerId);

                disp(setCallDetails({
                    avatar,
                    callerId,
                    callId,
                    roomId,
                    searchTag,
                    email
                }));

                if (callerId === user._id) {
                    console.log("You made an incoming call")
                    disp(setMemberCount({ type: "INC" }));

                    disp(requestVideoCall({
                        details: {
                            avatar,
                            callId,
                            roomId,
                            searchTag
                        }
                    }));

                    disp(incomingVideoCall({
                        details: {
                            avatar: avatar,
                            callId,
                            roomId,
                            searchTag
                        }
                    }));


                    socket?.emit(ChatEventsEnum.JOIN_VIDEO_ROOM_TEST, {
                        avatar: user.avatar,
                        searchTag: searchTag,
                        callerId: callerId,
                        roomId: roomId,
                        callId: callId,
                        userId: user._id
                    });
                } else {
                    disp(setCallDetails({
                        avatar,
                        callerId,
                        callId,
                        email,
                        roomId,
                        searchTag
                    }))
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
        }

        async function handleJoinendRoom({ userId }: { userId: string; }) {
            console.log("joined the chat")
            const freshCallerDet = store.getState().call
            disp(setIncomingCallState())
            console.log("the state caller id: ", freshCallerDet.callingDet.callerId)
            console.log("callerId: ", userId)
            if (freshCallerDet.callingDet.callerId !== userId) {
                console.log("You are not the caller member")
                disp(setMemberCount({ type: "INC" }));
                disp(pickUpCall())
            }
        }

        socket?.on(ChatEventsEnum.INCOMING_VIDEO_ROOM_TEST, handleIncomingCallTest);

        socket?.on(ChatEventsEnum.JOINED_VIDEO_ROOM_TEST, handleJoinendRoom);

        return () => {
            // socket?.off(ChatEventsEnum.INCOMING_VIDEO_CALL, handleIncomingCall);
            socket?.off(ChatEventsEnum.INCOMING_VIDEO_ROOM_TEST, handleIncomingCallTest);
            socket?.off(ChatEventsEnum.JOINED_VIDEO_ROOM_TEST, handleJoinendRoom);
        }
    }, [socket, isLoggedIn])


    useEffect(() => {
        if (isAnswered) {
            nav("/user/call/video-test")
        }
    }, [isAnswered]);


    return <RtcContext.Provider value={null}>{children}</RtcContext.Provider>
}

export default RtcProvider;