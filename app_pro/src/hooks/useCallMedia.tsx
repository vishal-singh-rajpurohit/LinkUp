import { useCallback, useState } from "react";

export interface callerTypes {
    callerName: string;
    callerId: string;
    avatar: string;
    callId: string;
    stream: MediaStream;
}

const useCallMedia = () => {
    const [members, setMembers] = useState<callerTypes[]>([]);

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
    }
}

export default useCallMedia;