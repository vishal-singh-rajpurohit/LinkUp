import React, { useContext } from "react";
import { Mic, PhoneOff, Video } from "lucide-react";
import { WSContext } from "../../context/Contexts";
import dp from '../../assets/no_dp.png'
import { useAppSelector } from "../../app/hooks";

const LocalStream = () => {
    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw new Error("Socket context not found")
    }

    const { video } = socketContext

    return (
        <section className="">
            <div className="">
                <video ref={video.localVideoRef} autoPlay muted className="" />
            </div>
        </section>
    );
}

const RemoteStream = ({ }: {
}) => {
    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw Error("Context not found")
    }

    const { video } = socketContext

    return (
        <section className="">
            <div className="">
                <video ref={video.remoteVideoRef} autoPlay muted className="" />
            </div>
        </section>
    );
}

const VideoCallPage: React.FC = () => {
    const callDet = useAppSelector((state) => state.call.callingDet)

    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw new Error("Socket context not found")
    }

    const { video } = socketContext

    return (
        <div className="w-[100vw] h-[100vh]  grid grid-rows-[1fr_9fr] bg-gray-900">
            <section className="flex gap-4 items-center h-12 bg-black ">
                <div className="w-10 h-10 rounded-4xl overflow-hidden">
                    <img src={dp} className="w-full h-full " alt="" />
                </div>
                <div className="text-2xl">{callDet.searchTag || "Virat Kohli"}</div>
            </section>
            <div className="grid grid-rows-2 md:flex md:flex-row md:h-full md:gap-1 items-center justify-start">
                {video.remoteStream && <RemoteStream />}
                {video.localStreamRef.current && <LocalStream />}
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
                    <PhoneOff size={20} />
                </button>
            </div>
        </div>
    );
};

export default VideoCallPage;
