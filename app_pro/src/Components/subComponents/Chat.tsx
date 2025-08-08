// import { CiMenuKebab } from 'react-icons/ci'
import g from '../../assets/no_dp.png'
import { MdCall, MdVideoCall } from 'react-icons/md'
import { TiAttachmentOutline } from 'react-icons/ti'
import { RiSendPlaneFill } from 'react-icons/ri'
import { BsEmojiWink } from 'react-icons/bs'
import { Mail, MailMenu } from './Mails'
import { FaAngleLeft, FaImage } from 'react-icons/fa'
import { useRef } from 'react'
import { useAppSelector } from '../../app/hooks'
import { getTimeDifference } from '../../helpers/timeConverter'
import { NavLink, useNavigate } from 'react-router-dom'

export const ChatArea = () => {
    const room = useAppSelector((state) => state.temp.selectedContact)

    return (
        <section className="hidden w-full h-[100vh] md:flex items-center justify-center">
            <section className="hidden flex-col gap-[1rem] items-center pt-2 w-[90%] h-[98%] rounded-lg md:flex">
                {
                    room ? (
                        <>
                            <ChatTop />
                            <MailBox />
                        </>
                    ) :
                        (
                            <section className='w-full h-full flex justify-center items-center overflow-y-hidden rounded-sm bg-[#1F2937] '>
                                <p className="">Select Contact to start talking</p>
                            </section>
                        )
                }

            </section>
        </section>
    )
}

export const ChatTop = () => {
    const router = useNavigate()
    const room = useAppSelector((state) => state.temp.selectedContact)
    const chatTypes = useAppSelector((state) => state.temp.chatListTypes)
    const lastOnline = getTimeDifference(room?.time || Date())

    async function getDetails() {
        router(`/chat/details/?room_id=${room?._id}`)
    }

    return (
        <div className='h-[4rem] w-full cursor-pointer bg-slate-800 rounded-t-lg' >
            <div className="grid h-full w-full grid-cols-[0.2fr_1fr_5fr_1fr_0.3fr] items-center px-3 md:grid-cols-[0.2fr_1fr_7fr_1fr_0.3fr] ">
                <NavLink to={'/'} >
                    <div className="w-full flex items-center justify-center"><FaAngleLeft size={20} /></div>
                </NavLink>
                <div className="w-full overflow-hidden h-full flex items-center justify-center">
                    <div onClick={getDetails} className='w-[2.5rem] h-[2.5rem] flex items-center justify-center overflow-hidden rounded-[10rem] bg-amber-300 md:h-[2.5rem] md:w-[2.5rem]'>
                        <img src={room?.avatar || g} alt="😒" className="max-h-[2.5rem] h-full" />
                    </div>
                </div>
                <div className="w-full h-full pl-1 flex gap-0  justify-center flex-col">
                    <p className="text-lg font-mono text-blue-100 md:text-lg">{room?.userName}</p>
                    <p className="text-[12px] font-serif text-gray-300 md:text-sm">{chatTypes === 2 ? `last message ${lastOnline}` : room?.isOnline ? "Online" : `Last Online: ${lastOnline}`}
                        {/* <div className="w-2 h-2 bg-green-400 rounded-2xl" ></div> */}
                    </p>
                </div>
                <div className="flex gap-3 justify-center items-center">
                    <MdVideoCall size={20} />
                    <MdCall size={20} />
                </div>
                {/* <div className="">
                    <span className=""><CiMenuKebab size={20} /></span>
                </div> */}
            </div>
        </div >
    )
}

export const MailBox = () => {
    return (
        <section className='w-full h-full overflow-y-scroll rounded-sm bg-[#1F2937]  grid grid-rows-[9fr_1fr] py-1.5 px-1'>
            <ChatBox />
            <MailOptions />
        </section>
    )
}

const MailOptions = () => {
    return (
        <>
            {/* <EmojiBox /> */}
            {/* <AttechMents /> */}
            <section className='w-full h-full max-h-[3rem] flex items-center justify-center '>
                <div className='w-[90%] h-full grid grid-cols-[7fr_3fr] items-center content-center border-1 border-white rounded-md md:grid-cols-[7fr_3fr] lg:grid-cols-[8fr_2fr] lg:gap-1.5'>
                    <div className="w-full h-full flex items-center justify-center pl-2">
                        <input type="text" placeholder='write a message....' className="w-full h-full outline-0 text-sm text-gray-2 00 font-serif" />
                    </div>
                    <div className="h-full w-full flex items-center justify-center gap-2 ">
                        <TiAttachmentOutline size={20} cursor={'pointer'} />
                        <BsEmojiWink size={18} cursor={'pointer'} />
                        <button className="bg-[#00F0FF] h-[2rem] w-[2rem] flex items-center justify-center rounded-sm c cursor-pointer md:w-[4rem] md:h-[2rem]"><RiSendPlaneFill className='lg:text-[25px]' /> </button>
                    </div>
                </div>
            </section>
        </>

    )
}

//emoji Box
const EmojiBox = () => {
    return (
        <div className="w-[90%] overflow-auto flex justify-end mb-1 lg:h-[7rem]" style={{ scrollbarWidth: 'none' }}>
            <div className="w-[90%] h-full overflow-auto relative bg-[#ffffff5d] rounded-sm" style={{ scrollbarWidth: 'none' }}>
                <div className='grid grid-cols-10 overflow-y-auto' style={{ scrollbarWidth: 'none' }}>
                    {
                        Array(100).fill('😭').map((emoji) => (
                            <div className="cursor-pointer">{emoji}</div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

// Attechment Box
const AttechMents = () => {
    return (
        <section className="w-[80%] h-[5rem] overflow-auto flex justify-end mb-1 lg:h-[7rem] mt-1">
            <div className="w-[30%] h-full overflow-auto relative rounded-sm flex items-center justify-center" style={{ scrollbarWidth: 'none' }}>
                <div className=" bg-[#ffffff5d] w-full h-full grid grid-cols-2 gap-4 justify-center">
                    <div className="w-full h-full flex items-center justify-center"><FaImage size={20} cursor={'pointer'} /></div>
                    <div className="w-full h-full flex items-center justify-center"><FaImage size={20} cursor={'pointer'} /></div>
                    <div className="w-full h-full flex items-center justify-center"><FaImage size={20} cursor={'pointer'} /></div>
                    <div className="w-full h-full flex items-center justify-center"><FaImage size={20} cursor={'pointer'} /></div>
                </div>
            </div>
        </section>
    )
}

const ChatBox = () => {
    const mailOptions = useRef<HTMLDivElement | null>(null)

    return (
        <section className="h-full overflow-y-auto flex flex-col gap-5 p-1 pb-4" style={{ scrollbarWidth: 'none' }}>
            <MailMenu mailRef={mailOptions} />
            <Mail mailOptions={mailOptions} />
            <Mail mailOptions={mailOptions} />
            <Mail mailOptions={mailOptions} />
        </section>
    )
}