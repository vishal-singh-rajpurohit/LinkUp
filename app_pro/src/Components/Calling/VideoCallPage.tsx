import React, { useContext } from "react";
import { Mic, PhoneOff, Video } from "lucide-react";
import { WSContext } from "../../context/Contexts";
import dp from '../../assets/no_dp.png'
import { useAppSelector } from "../../app/hooks";

const VideoCallPage: React.FC = () => {
    const callDet = useAppSelector((state) => state.call.callingDet)

    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw new Error("Socket context not found")
    }

    const { video, clearCall } = socketContext;

    return (
        <div className="w-[100vw] h-[100vh]  grid grid-rows-[1fr_9fr] bg-gray-900">
            <section className="flex gap-4 items-center h-12 bg-black ">
                <div className="w-10 h-10 rounded-4xl overflow-hidden">
                    <img src={dp} className="w-full h-full " alt="" />
                </div>
                <div className="text-2xl">{callDet.searchTag || "Virat Kohli"}</div>
            </section>
            <div className="relative w-full h-full">
                <video
                    ref={video.remoteVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover bg-[#0a1735]"
                />
                <div className="absolute left-3 top-3 z-30 rounded bg-black/60 px-2 py-1 text-xs text-white">
                    {video.remoteStream ? "REMOTE: ON" : "REMOTE: OFF"}
                </div>
                <video
                    ref={video.localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute right-4 bottom-24 z-20 w-36 h-52 md:w-56 md:h-80 rounded-xl overflow-hidden border border-white/30 bg-black object-cover"
                />
            </div>
            <div className="flex fixed bottom-0 w-full justify-center items-center gap-4 p-4 bg-black/80">
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
                    <PhoneOff onClick={async () => await clearCall()} size={20} />
                </button>
            </div>
        </div>
    );
};

export default VideoCallPage;
