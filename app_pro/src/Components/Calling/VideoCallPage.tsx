import React, { useContext, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, PhoneOff, Video } from "lucide-react";
import * as mediasoupClient from "mediasoup-client"
import { WSContext } from "../../context/Contexts";
import { useAppSelector } from "../../app/hooks";


const Participant = ({ name, muted, videoOff }: {name: string, muted: boolean, videoOff: boolean;}) => {
    const user = useAppSelector((state)=>state.auth.user)
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw Error("Context not found")
    }

    const { socket } = socketContext

    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        async function init() {
            // Step 1: Create room
            if (socket) {
                socket.emit("createRoom", async ({ roomId, rtpCapabilities }) => {
                    console.log("Room created", roomId);

                    const device = new mediasoupClient.Device();
                    await device.load({ routerRtpCapabilities: rtpCapabilities });

                    // Step 2: Create transport
                    socket.emit("createWebRtcTransport", { roomId, sender: true }, async (params) => {
                        const transport = device.createSendTransport(params);

                        transport.on("connect", ({ dtlsParameters }, callback) => {
                            socket.emit("connectTransport", { roomId, dtlsParameters });
                            callback();
                        });

                        transport.on("produce", ({ kind, rtpParameters }, callback) => {
                            socket.emit("produce", { roomId, kind, rtpParameters }, ({ id }) => callback({ id }));
                        });

                        // Step 3: Capture camera
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                        stream.getTracks().forEach(track => transport.produce({ track }));

                        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                    });
                });
            }
        }

        init();
    }, []);

    
    return (
        <motion.div
            layout
            className="relative bg-black rounded-2xl overflow-hidden shadow-md flex items-center justify-center"
        >
            {/* Video */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${videoOff ? "hidden" : "block"}`}
            />
            {/* Placeholder if video is off */}
            {videoOff && (
                <div className="flex items-center justify-center w-full h-full text-white bg-gray-800 text-3xl font-semibold">
                    { name.charAt(0).toUpperCase()}
                </div>
            )}
            {/* Participant info */}
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                {user.searchTag === name ? "YOU" : name} {muted && <MicOff size={14} className="inline ml-1" />}
            </div>
        </motion.div>
    );
};

const VideoCallPage: React.FC = () => {

    // const user = useAppSelector((state)=>state.auth.user)

    const participants = [
        { name: "ironman", muted: false, videoOff: false },
        { name: "Anita", muted: true, videoOff: false },
        { name: "Rahul", muted: false, videoOff: true },
        { name: "Priya", muted: false, videoOff: false },
    ];

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Video Grid */}
            <div className="flex-1 grid gap-2 p-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {participants.map((p, idx) => (
                    <Participant key={idx} {...p} />
                ))}
            </div>

            {/* Control Bar */}
            <div className="flex justify-center items-center gap-4 p-4 bg-black/80">
                <button
                    aria-label="Toggle microphone"
                    className="rounded-full p-3 bg-white/10 hover:bg-white/20 text-white shadow focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                    <Mic size={20} />
                </button>
                <button
                    aria-label="Toggle camera"
                    className="rounded-full p-3 bg-white/10 hover:bg-white/20 text-white shadow focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                    <Video size={20} />
                </button>
                <button
                    aria-label="End call"
                    className="rounded-full p-3 bg-red-600 hover:bg-red-700 text-white shadow focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                    <PhoneOff size={20} />
                </button>
            </div>
        </div>
    );
};

export default VideoCallPage;
