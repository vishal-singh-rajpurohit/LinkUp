import { useCallback, useRef, useState } from "react";
import {types} from "mediasoup-client"

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
    const [members, setMembers] = useState<callerTypes[]>([]);
    const [remoteStream, setRemoteStream] = useState<videoType[]>([]);
    const consumers = useRef<Map<string, types.Consumer>>(new Map())

    const addTrack = useCallback((track: MediaStreamTrack, callerInfo: Omit<callerTypes, 'stream'>)=>{
        setMembers((prevMembers)=>{
            const existingStream = prevMembers.find((m)=>m.callerId === callerInfo.callerId)

            if(existingStream){
                existingStream.stream.addTrack(track)
                return [...prevMembers]
            }

            const newStream = new MediaStream([track])
            return [...prevMembers, {stream: newStream, ...callerInfo}]
        });
    }, []);

    const removeParticipant = useCallback((callerId: string)=>{
        setMembers((prev)=>prev.filter(m =>m.callerId !== callerId))
    }, []);

    return {
        members,
        removeParticipant,
        addTrack,
        remoteStream,
        setRemoteStream,
        consumers
    }
}

export default useCallMedia;