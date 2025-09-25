import { useRef, useState } from "react";
import { useAppSelector } from "../app/hooks";
import { type types, Device } from "mediasoup-client";

const useLocalMedia = () => {
    const user = useAppSelector((state)=>state.auth.user)
    const localStream = useRef<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null)
    const [lRtpCapabilities, setLRtpCapabilities] = useState<types.RtpCapabilities | null>(null)
    // const audioEnable = useAppSelector((state) => state.call.audioEnabled)
    // const videoEnable = useAppSelector((state) => state.call.videoEnable)
    // const callingStatus = useAppSelector((state) => state.call.callStatus)
    const sendTransport = useRef<types.Transport | null>(null)
    const recvTransport = useRef<types.Transport | null>(null)

    const audioProducer = useRef<types.Producer | null>(null)
    const videoProducer = useRef<types.Producer | null>(null)

    const device = useRef<types.Device | null>(null)

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

    async function createDevice() {
        try {
            if (!lRtpCapabilities) return;
            device.current = new Device()

            await device.current.load({ routerRtpCapabilities: lRtpCapabilities })
        } catch (error) {
            console.log('Error creating device: ', error)
            throw new Error("Error creating device: ")
        }
    }

    async function getLocalMediaAndProduce() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            localStream.current = stream;
            if(localVideoRef.current) localVideoRef.current.srcObject = stream
            // params.current.track = stream.getVideoTracks()[0]

            if (sendTransport.current) {
                const audioTrack = stream.getAudioTracks()[0];
                const videoTrack = stream.getVideoTracks()[0];

                if (audioTrack) {
                    audioProducer.current = await sendTransport.current.produce({
                        track: audioTrack,
                        encodings: [{ scalabilityMode: 'S1T1' }],
                        codecOptions: { opusStereo: true, opusFec: true },
                        appData: { userId:user._id, userName: user.searchTag, kind: 'audio' }
                    })
                }

                if(videoTrack){
                    videoProducer.current = await sendTransport.current.produce({
                        track: videoTrack,
                            encodings: [{ maxBitrate: 500000, scalabilityMode: 'S1T3' }],
                            appData: { userId:user._id, userName: user.searchTag, kind: 'video' }
                    })
                }
            }

        } catch (error) {
            console.error(error)
            throw new Error("Error in getting LocalMEdia")
        }
    }

    return {
        localStream,
        localVideoRef,
        getLocalMediaAndProduce,
        params,
        lRtpCapabilities,
        setLRtpCapabilities,
        createDevice,
        sendTransport,
        recvTransport,
        audioProducer,
        videoProducer,
        device
    }
}

export default useLocalMedia;