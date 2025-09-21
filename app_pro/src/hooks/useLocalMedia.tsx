import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../app/hooks";
import type { types } from "mediasoup-client";

const useLocalMedia = () => {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const audioEnable = useAppSelector((state) => state.call.audioEnabled)
    const videoEnable = useAppSelector((state) => state.call.videoEnable)
    const isCalling = useAppSelector((state) => state.call.isCalling)
    const params = useRef<types.ProducerOptions>({
        encodings: [
            {
                rid: 'r0',
                maxBitrate: 100000,
                scalabilityMode: 'S1T3' 
            },
            {
                rid: 'r1',
                maxBitrate: 300000,
                scalabilityMode: 'S1T3' 
            },
            {
                rid: 'r12',
                maxBitrate: 900000,
                scalabilityMode: 'S1T3' 
            },
        ],
        codecOptions: {
            videoGoogleStartBitrate: 1000
        },
        track: undefined
        
    })



    let stream: MediaStream;
    useEffect(() => {
        if (isCalling) {
            const init = async () => {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ audio: audioEnable, video: videoEnable })
                    setLocalStream(stream)
                    params.current.track =  stream.getVideoTracks()[0];
                } catch (error) {
                    console.log("Error while gettig the medai: ", error)
                }
            }

            init()

            return () => { stream?.getTracks().forEach(track => track.stop()) }
        }
    }, [localStream, setLocalStream, isCalling])


    async function getAndSetLocalStream(
        // roomId: string, callId: string, searchTag: string, callerId: string, rtpCapabilities: mediasoup.types.RtpCapabilities
    ) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: audioEnable, video: videoEnable })
            setLocalStream(stream)
            params.current.track =  stream.getVideoTracks()[0];
                
        } catch (error) {
            console.log("Error while gettig the medai: ", error)
        }
    }

    return {
        localStream,
        getAndSetLocalStream,
        params
    }
}

export default useLocalMedia;