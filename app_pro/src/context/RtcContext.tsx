import React, { useContext, useEffect } from "react";
import { RtcContext, WSContext, type RtcTypes } from "./Contexts";
import { useAppSelector } from "../app/hooks";
import { CallEventEnum } from "./constant";
import { useNavigate } from "react-router-dom";

const RtcProvider = ({ children }: { children: React.ReactNode }) => {
    const nav = useNavigate();

    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
    const callStatus = useAppSelector((state) => state.call.callStatus)

    const SocketContext = useContext(WSContext);
    
    if (!SocketContext) {
        throw new Error("Socket not found");
    }

    const { socket } = SocketContext;

    useEffect(() => {
        if (!isLoggedIn) return;

        async function onCallError({ message }: { message: string }) {
            console.log("Error => ", message)
        }

        return () => {
            socket?.off(CallEventEnum.CALL_EVENT_ERROR, onCallError)
        }
    }, [socket, isLoggedIn])

    useEffect(() => {
        if (callStatus === "ACTIVE") {
            nav("/user/call/video")
        }
    }, [callStatus]);

    const data: RtcTypes = {}


    return <RtcContext.Provider value={data}>{children}</RtcContext.Provider>
}

export default RtcProvider;