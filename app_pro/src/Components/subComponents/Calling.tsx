import g from "../../assets/no_dp.png"
import { PhoneCall, PhoneOff } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { useContext, useEffect } from "react"
import { WSContext } from "../../context/Contexts"
import { IoClose } from "react-icons/io5"
import { setCallingStatus, clearCall as clearCallfunc } from "../../app/functions/call"
import { callEventEnum } from "../../context/constant"

export const RequestedVideoCall = () => {
    const room = useAppSelector((state) => state.temp.selectedContact)
    const call_status = useAppSelector((state) => state.call.callStatus)
    const user = useAppSelector((state) => state.auth.user)

    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw Error("Socket not found")
    }

    const { clearCall } = socketContext;

    useEffect(() => {
        if (call_status === "OUTGOING") {
            const timeout = setTimeout(clearCall, 15000);
            return () => clearTimeout(timeout)
        }
    }, [call_status, clearCall])

    async function cut_call() {
        socketContext?.socket?.emit(callEventEnum.CANCELLED_BEFORE_ANSWER, { contactId: room._id, callerId: user._id });
        await clearCall();
    }

    return (
        call_status === "OUTGOING" ? (
            <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-white/15 text-center flex flex-col items-center gap-5">
                    <p className="text-xs font-extrabold accent-text tracking-widest uppercase animate-pulse">Calling Video...</p>
                    
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--c-accent)] shadow-2xl bg-slate-700">
                            <img src={room.avatar || g} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute inset-0 rounded-full border-2 border-[var(--c-accent)] animate-ping opacity-75"></span>
                    </div>

                    <div>
                        <h3 className="font-extrabold text-lg text-[var(--c-text-primary)]">{room.searchTag || room.userName || 'Contact'}</h3>
                        <p className="text-xs text-[var(--c-text-muted)] mt-0.5">Ringing...</p>
                    </div>

                    <button 
                        onClick={cut_call}
                        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-110 transition cursor-pointer"
                    >
                        <PhoneOff size={22} />
                    </button>
                </div>
            </section>
        ) : null
    )
}

export const IncomingVideoCall = () => {
    const room = useAppSelector((state) => state.temp.selectedContact)
    const call_status = useAppSelector((state) => state.call.callStatus)

    const socketContext = useContext(WSContext)
    if (!socketContext) {
        throw new Error("Socket not found: ")
    }
    const { answerVideoCall, denayCall } = socketContext;

    function denayCallFunc() {
        denayCall()
    }

    return (
        call_status === "INCOMING" ? (
            <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-white/15 text-center flex flex-col items-center gap-5">
                    <p className="text-xs font-extrabold text-emerald-400 tracking-widest uppercase animate-pulse">Incoming Video Call</p>

                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-400 shadow-2xl bg-slate-700">
                            <img src={room.avatar || g} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75"></span>
                    </div>

                    <div>
                        <h3 className="font-extrabold text-lg text-[var(--c-text-primary)]">{room.searchTag || room.userName || 'Incoming Call'}</h3>
                        <p className="text-xs text-[var(--c-text-muted)] mt-0.5">Wants to video call with you</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={async () => await answerVideoCall()} 
                            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black flex items-center justify-center shadow-xl hover:scale-110 transition cursor-pointer font-bold"
                        >
                            <PhoneCall size={22} />
                        </button>
                        <button 
                            onClick={denayCallFunc} 
                            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-110 transition cursor-pointer"
                        >
                            <PhoneOff size={22} />
                        </button>
                    </div>
                </div>
            </section>
        ) : null
    )
}

export const FailVideoCall = () => {
    const disp = useAppDispatch();
    const room = useAppSelector((state) => state.temp.selectedContact)
    const call_status = useAppSelector((state) => state.call.callStatus)

    function close() {
        disp(setCallingStatus({ status: 'OFF' }));
        disp(clearCallfunc());
    }

    return (
        call_status === "ENDED" ? (
            <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-white/15 text-center flex flex-col items-center gap-5">
                    <p className="text-xs font-extrabold text-red-400 tracking-widest uppercase">Call Ended</p>

                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 shadow-xl bg-slate-700 opacity-70">
                        <img src={room.avatar || g} alt="" className="w-full h-full object-cover" />
                    </div>

                    <button 
                        onClick={close} 
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shadow-lg transition cursor-pointer"
                    >
                        <IoClose size={24} />
                    </button>
                </div>
            </section>
        ) : null
    )
}
