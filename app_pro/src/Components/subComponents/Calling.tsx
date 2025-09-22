import g from "../../assets/no_dp.png"
import { PhoneCall, PhoneOff } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { useContext } from "react"
import { WSContext } from "../../context/Contexts"
import { ChatEventsEnum } from "../../context/constant"
import { IoClose } from "react-icons/io5"
import { useDispatch } from "react-redux"
import { setCallingStatus } from "../../app/functions/call"

export const RequestedVideoCall = () => {
    const room = useAppSelector((state) => state.temp.selectedContact)
    const callDet = useAppSelector((state) => state.call.callingDet)
    const call_status = useAppSelector((state) => state.call.callStatus)

    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw Error("Socket not found")
    }

    const { socket } = socketContext

    function cancelCall() {
        if (socketContext) {
            socket?.emit(ChatEventsEnum.CANCELLED_VIDEO_CALL, { roomId: callDet.roomId, callId: callDet.callId })
        }
    }

    return (
        call_status === "OUTGOING" ? (
            <section className="selection:bg-transparent w-full h-full fixed top-0 left-0 flex items-center justify-center z-50">
                <div className="w-[17rem] h-[16rem] bg-slate-900 rounded-md flex flex-col gap-4 items-center justify-center">
                    <div className="">
                        <p className="">CONNECTING VIDEO CALL</p>
                    </div>
                    <div className="w-[5rem] h-[5rem] rounded-[50%] overflow-hidden">
                        <img src={g || room.avatar} alt="" className="w-full h-full" />
                    </div>
                    <div className="">
                        <h3 className="uppercase sfont-bold text-md">Thor</h3>
                    </div>
                    <div className="flex gap-8">
                        <div onClick={cancelCall} className="w-[3rem] h-[3rem] bg-red-500 flex items-center justify-center rounded-[50%] cursor-pointer">
                            <PhoneOff size={20} />
                        </div>
                    </div>
                </div>
            </section>
        ) : null
    )
}

export const IncomingVideoCall = () => {
    const disp = useDispatch()
    const room = useAppSelector((state) => state.temp.selectedContact)
    const callDet = useAppSelector((state) => state.call.callingDet)
    const user = useAppSelector((state) => state.auth.user)
    const call_status = useAppSelector((state) => state.call.callStatus)

    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw Error("Socket not found")
    }

    const { socket } = socketContext

    async function answerTheCall() {
        try {
            if (socketContext) {
                socket?.emit(ChatEventsEnum.JOIN_VIDEO_ROOM_TEST, {
                    roomId: callDet.roomId,
                    callId: callDet.callId,
                    avatar: callDet.avatar,
                    searchTag: callDet.searchTag,
                    callerId: callDet.callerId,
                    userId: user._id
                }, () => {
                    console.log("Call made success fully with CALLBACK")
                });
            }
        } catch (error) {
            console.log("Error in answer call: ", error)
        }
    }

    async function declineCall() {
        if (socketContext) {
            try {
                disp(setCallingStatus({ status: "ENDED" }))

                // socket?.emit(ChatEventsEnum.REJECT_VIDEO_CALL, { roomId: callDet.roomId, userId: user._id, callId: callDet.callId })
            } catch (error) {
                console.log("Error in reject call: ", error)
            }
        }
    }


    return (
        call_status === "INCOMING" ? (
            <section className="selection:bg-transparent w-full h-full fixed top-0 left-0 flex items-center justify-center">
                <div className="w-[17rem] h-[16rem] bg-slate-900 rounded-md flex flex-col gap-4 items-center justify-center">
                    <div className="">
                        <p className="">INCOMING VIDEO CALL</p>
                    </div>
                    <div className="w-[5rem] h-[5rem] rounded-[50%] overflow-hidden">
                        <img src={g || room.avatar} alt="" className="w-full h-full" />
                    </div>
                    <div className="">
                        <h3 className="uppercase font-bold text-md">Thor</h3>
                    </div>
                    <div className="flex gap-8">
                        <div onClick={answerTheCall} className="w-[3rem] h-[3rem] bg-green-500 flex items-center justify-center rounded-[50%] cursor-pointer">
                            <PhoneCall size={20} />
                        </div>
                        <div onClick={declineCall} className="w-[3rem] h-[3rem] bg-red-500 flex items-center justify-center rounded-[50%] cursor-pointer">
                            <PhoneOff size={20} />
                        </div>
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
        disp(setCallingStatus({ status: 'OFF' }))
    }

    return (
        call_status === "ENDED" ? (
            <section className="selection:bg-transparent w-full h-full fixed top-0 left-0 flex items-center justify-center">
                <div className="w-[17rem] h-[16rem] bg-slate-900 rounded-md flex flex-col gap-4 items-center justify-center">
                    <div className="">
                        <p className="font-bold">CALL ENDED</p>
                    </div>
                    <div className="w-[5rem] h-[5rem] rounded-[50%] overflow-hidden">
                        <img src={g || room.avatar} alt="" className="w-full h-full" />
                    </div>
                    <div className="flex gap-8">
                        <div onClick={close} className="w-[3rem] h-[3rem] bg-red-500 flex items-center justify-center rounded-[50%] cursor-pointer">
                            <IoClose size={40} />
                        </div>
                    </div>
                </div>

            </section>
        ) : null
    )
}

