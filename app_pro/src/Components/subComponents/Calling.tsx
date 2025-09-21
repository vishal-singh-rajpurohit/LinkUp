import g from "../../assets/no_dp.png"
import { PhoneCall, PhoneOff } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { callFailure } from "../../app/functions/temp"
import { useContext } from "react"
import { RtcContext, WSContext } from "../../context/Contexts"
import { ChatEventsEnum } from "../../context/constant"
import { IoClose } from "react-icons/io5"
import { useDispatch } from "react-redux"
import { setCalling } from "../../app/functions/call"
import useLocalMedia from "../../hooks/useLocalMedia"
import type { RtpCapabilities } from "mediasoup-client/types"


export const RequestedVideoCall = () => {
    const isRequestedCall = useAppSelector((state) => state.temp.requestedVideoCall)
    const room = useAppSelector((state) => state.temp.selectedContact)
    const callDet = useAppSelector((state) => state.temp.callDetails)

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
        isRequestedCall ? (
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
    const isIncoming = useAppSelector((state) => state.temp.incomingVideoCall)
    const room = useAppSelector((state) => state.temp.selectedContact)
    const callDet = useAppSelector((state) => state.call.callingDet)
    const user = useAppSelector((state) => state.auth.user)
    const { getAndSetLocalStream } = useLocalMedia()

    const socketContext = useContext(WSContext)
    const rtcContext = useContext(RtcContext);

    if (!socketContext || !rtcContext) {
        throw Error("Socket not found")
    }

    const { socket } = socketContext
    const {connectReciverTransport, createReciverTransport, createSendTransport, loadDevice, setRtpCapabilities} = rtcContext;

    async function answerTheCall() {
        try {
            if (socketContext) {
                disp(setCalling({ trigger: true }))
                await getAndSetLocalStream()

                socket?.emit(ChatEventsEnum.ANSWER_VIDEO_CALL,
                    {
                        roomId: callDet.roomId,
                        callId: callDet.callId,
                        avatar: callDet.avatar,
                        searchTag: callDet.searchTag,
                        callerId: user._id
                    },
                    async (data: { rtpCapabilities: RtpCapabilities }) => {
                        console.log("rtpCapabilities recived: ", data.rtpCapabilities)
                        setRtpCapabilities(data.rtpCapabilities)
                        await loadDevice(data.rtpCapabilities);
                        console.log("the device locaded")
                        await createSendTransport()
                        await createReciverTransport();
                        await connectReciverTransport();

                    })
            }
        } catch (error) {
            console.log("Error in answer call: ", error)
        }

    }



    async function declineCall() {
        if (socketContext) {
            try {
                disp(setCalling({ trigger: true }))
                await getAndSetLocalStream()
                socket?.emit(ChatEventsEnum.REJECT_VIDEO_CALL, { roomId: callDet.roomId, userId: user._id, callId: callDet.callId })
            } catch (error) {
                console.log("Error in reject call: ", error)
            }
        }
    }


    return (
        isIncoming ? (
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
    const open = useAppSelector((state) => state.temp.cannotConnect)
    const room = useAppSelector((state) => state.temp.selectedContact)


    function close() {
        disp(callFailure({ trigger: false }))
    }

    return (
        open ? (
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

