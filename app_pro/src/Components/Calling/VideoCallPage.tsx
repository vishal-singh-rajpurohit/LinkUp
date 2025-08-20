import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, PhoneOff, Video } from "lucide-react";

interface ParticipantProps {
    name: string;
    muted?: boolean;
    videoOff?: boolean;
}

const Participant: React.FC<ParticipantProps> = ({ name, muted, videoOff }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

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
                    {name.charAt(0).toUpperCase()}
                </div>
            )}
            {/* Participant info */}
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                {name} {muted && <MicOff size={14} className="inline ml-1" />}
            </div>
        </motion.div>
    );
};

const VideoCallPage: React.FC = () => {
    const participants = [
        { name: "Vishal", muted: false, videoOff: false },
        { name: "Anita", muted: true, videoOff: false },
        { name: "Rahul", muted: false, videoOff: true },
        { name: "Priya", muted: false, videoOff: false },
    ];

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            hiis
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
