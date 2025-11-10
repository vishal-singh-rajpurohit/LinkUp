import { useContext, useRef } from "react";
import {types} from "mediasoup-client"
import peer from "../context/PeerPackages"
import { WSContext } from "../context/Contexts";
import { CallEventEnum } from "../context/constant";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { clearCall } from "../app/functions/call";

export interface callerTypes {
    callerName: string;
    callerId: string;
    avatar: string;
    callId: string;
    stream: MediaStream;
}

export interface videoType{
    userName: string;
    userId: string;
    stream: MediaStream;
    producerId: string;
    isPaused: boolean;
}

export interface Consumer extends types.Consumer{
    producerId: string;
    isPaused: boolean;
}

const useCallMedia = () => {
    const disp = useAppDispatch()

    const user = useAppSelector((state)=>state.auth.user);
    const selectedContact = useAppSelector((state)=>state.temp.selectedContact);
    const call = useAppSelector((state)=>state.call.callingDet);

    const members = useRef<callerTypes[]>([]);
    const remoteStream = useRef<videoType[]>([]);
    const localStream = useRef<MediaStream | null>(null);

    const SocketContext = useContext(WSContext);

    if(!SocketContext){
        throw new Error("Socket context not found: ");
    }

    const {socket} = SocketContext;

    async function makeVideoCall(){
        try {
            if(socket && socket.connected){
                console.log("making video call: ", socket)
                
                socket?.emit(CallEventEnum.REQUEST_VIDEO_CALL, {userId: user._id, contactId: selectedContact._id});
            }
        } catch (error) {
            if(error instanceof Error){
                throw new Error("Error in making video call ", error)
            }
        }
    }

    async function endVideoCall(){
        try {
            if(!call.callId) throw new Error("Call not found");

            peer.clearPeer();
            socket?.emit(CallEventEnum.END_VIDEO_CALL, {userId: user._id, contactId: selectedContact._id, callId: call.callId});

            disp(clearCall());
        } catch (error) {
         if(error instanceof Error){
            throw new Error("Error in ending video call: ", error)
         }   
        }
    }

    return {
        members,
        remoteStream,
        localStream,
        makeVideoCall,
        endVideoCall
    }
} 

export default useCallMedia;