import React, { useContext, useEffect } from "react";
import { Mic, MicOff, VideoOff, PhoneOff, Video } from "lucide-react";
import { WSContext } from "../../context/Contexts";
import dp from '../../assets/no_dp.png'
import { useAppSelector } from "../../app/hooks";

const VideoCallPage: React.FC = () => {
    const callDet = useAppSelector((state) => state.call.callingDet)

    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw new Error("Socket context not found")
    }

    const { video, clearCall, toggleAudio, toggleVideo, isAudioOn, isVideoOn } = socketContext;

    useEffect(() => {
        if (video.localVideoRef.current && video.localStreamRef.current) {
            video.localVideoRef.current.srcObject = video.localStreamRef.current;
        }
        if (video.remoteVideoRef.current && video.remoteStream) {
            video.remoteVideoRef.current.srcObject = video.remoteStream;
        }
    }, [video]);

    return (
        <div className="w-screen h-screen grid grid-rows-[auto_1fr] bg-[var(--c-app-bg)] text-[var(--c-text-primary)] relative overflow-hidden">
            {/* Top Bar Header */}
            <section className="flex items-center justify-between px-6 py-3 glass-panel border-b border-white/10 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--c-accent)] shadow-md bg-slate-700">
                        <img src={callDet.avatar || dp} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[var(--c-text-primary)]">{callDet.searchTag || 'Video Call'}</h2>
                        <div className="flex items-center gap-1.5 text-[10px] accent-text font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Encrypted Video Call</span>
                        </div>
                    </div>
                </div>
                <div className="text-xs font-semibold text-[var(--c-text-muted)] glass-card px-3 py-1.5 rounded-xl border border-white/10">
                    {video.remoteStream ? "Connected" : "Connecting..."}
                </div>
            </section>

            {/* Video Streams Container */}
            <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                    ref={video.remoteVideoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className="absolute left-4 top-4 z-30 glass-card px-3 py-1 rounded-xl border border-white/10 text-[10px] font-bold text-white shadow-lg">
                    {video.remoteStream ? "🟢 REMOTE: LIVE" : "🟡 REMOTE: CONNECTING"}
                </div>

                {/* Self Stream Miniature Floating Window */}
                <div className="absolute right-6 bottom-24 z-30 w-36 h-52 md:w-56 md:h-80 rounded-2xl overflow-hidden border-2 border-white/20 glass-panel shadow-2xl bg-slate-900 flex items-center justify-center">
                    <video
                        ref={video.localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : 'block'}`}
                    />
                    {!isVideoOn && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-900/95 text-slate-400 p-2 text-center select-none">
                            <div className="p-3 rounded-full bg-white/5 border border-white/10 text-red-400">
                                <VideoOff size={28} />
                            </div>
                            <span className="text-[11px] font-medium text-slate-300">Camera Off</span>
                        </div>
                    )}
                    {!isAudioOn && (
                        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600/90 text-white shadow-md" title="Muted">
                            <MicOff size={14} />
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Controls */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel px-6 py-3 rounded-full border border-white/15 shadow-2xl flex items-center gap-4">
                <button 
                    type="button"
                    onClick={toggleAudio}
                    aria-label="Toggle microphone"
                    className={`rounded-full p-3.5 transition cursor-pointer shadow-md ${
                        isAudioOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                    title={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
                >
                    {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                <button 
                    type="button"
                    onClick={toggleVideo}
                    aria-label="Toggle camera"
                    className={`rounded-full p-3.5 transition cursor-pointer shadow-md ${
                        isVideoOn ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                    title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
                >
                    {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>

                <button
                    type="button"
                    onClick={async () => await clearCall()}
                    aria-label="End call"
                    className="rounded-full p-3.5 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:scale-105 transition cursor-pointer"
                    title="End Call"
                >
                    <PhoneOff size={20} />
                </button>
            </div>
        </div>
    );
};

export default VideoCallPage;
