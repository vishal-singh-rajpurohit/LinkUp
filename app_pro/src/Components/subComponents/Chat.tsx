import g from '../../assets/no_dp.png'
import { MdCall, MdOutlineAudiotrack, MdOutlineFileOpen, MdOutlineImage, MdOutlineVideoLibrary, MdVideoCall } from 'react-icons/md'
import { TiAttachmentOutline } from 'react-icons/ti'
import { RiSendPlaneFill } from 'react-icons/ri'
import { BsEmojiWink } from 'react-icons/bs'
import { BottomButton, DeletedMessage, DeletedMessageMe, Mail, MailAttechment, MailAttechmentMe, MailMe, MailMenu, SendingMedia, TypingIndicator, UploadingMedia } from './Mails'
import { FaAngleLeft } from 'react-icons/fa'
import React, { useContext, useEffect, useRef, useState, type SetStateAction } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { getTimeDifference } from '../../helpers/timeConverter'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { setEmojiSelection, setFileSelection, setHasAttechments, setReplyState, toggleTyping, triggetUploadType } from '../../app/functions/temp'
import { CallEventEnum, ChatEventsEnum } from '../../context/constant'
import { AppContext, WSContext } from '../../context/Contexts'
import EmojiPicker from 'emoji-picker-react';

const api = import.meta.env.VITE_API;

export const ChatArea = () => {
    const room = useAppSelector((state) => state.temp.selectedContact)

    return (
        <section className="hidden w-full h-[100vh] md:flex items-center justify-center">
            <section className="hidden flex-col gap-[1rem] items-center pt-2 w-[90%] h-[98%] rounded-lg md:flex">
                {
                    room._id ? (
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
    const user = useAppSelector((state) => state.auth.user)
    const chatTypes = useAppSelector((state) => state.temp.chatListTypes)
    const lastOnline = getTimeDifference(room?.time || Date.now())
    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw Error("Context not found")
    }

    const { socket } = socketContext

    async function requestForVideoCall() {
        try {
            socket?.emit(CallEventEnum.REQUEST_VIDEO_CALL, {
                contactId: room._id,
                callerId: user._id,
                username: user.searchTag,
                avatar: room.avatar
            })

            console.log("Requested")

        } catch (error) {
            console.log('Error in Requesting video call: ', error);
        }
    }

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
                    <NavLink to={'/user/call/video'}>X</NavLink>
                    <MdVideoCall size={20} onClick={requestForVideoCall} />
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


interface geoLocType {
    latitude: string;
    longitude: string;
}
const MailOptions = () => {
    const disp = useAppDispatch()
    const contact = useAppSelector((state) => state.temp.selectedContact);
    const user = useAppSelector((state) => state.auth.user)
    const contain_files = useAppSelector((state) => state.temp.chatStates.hasAttechments)
    const isTyping = useAppSelector((state) => state.temp.typing)
    const openFilesSelection = useAppSelector((state) => state.temp.fileSelection);
    const openemojiSelection = useAppSelector((state) => state.temp.emojiSelection);
    const fileType = useAppSelector((state) => state.temp.fileType)
    const [message, setMessage] = useState<string>("");
    const [geoLoc] = useState<geoLocType>({
        latitude: '00', //meke empty in production
        longitude: '00' //meke empty in production
    })

    const socketContext = useContext(WSContext)
    const appContext = useContext(AppContext)

    if (!socketContext || !appContext) {
        throw new Error("Web socket context not found")
    }

    const { messageFormData } = appContext

    async function sendChat(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!message.trim()) return
        if (!message.trim() && !contain_files) return;

        try {
            const messageResp = await axios.post<{
                data: {
                    message_id: string
                }
            }>(`${api}/chat/message/send-msg`,
                {
                    message: message,
                    contactId: contact._id,
                    longitude: geoLoc.longitude,
                    latitude: geoLoc.latitude,
                    contain_files: contain_files
                },
                {
                    withCredentials: true,
                })
            setMessage("");

            if (contain_files) {
                messageFormData.append('fileType', fileType)
                messageFormData.append('contactId', String(contact._id))
                messageFormData.append('messageId', String(messageResp.data.data.message_id))

                await axios.post(`${api}/chat/message/attechment-upload`,
                    messageFormData,
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                )
            }
            messageFormData.delete('attechment')
            messageFormData.delete('fileType')
            messageFormData.delete('contactId')
            messageFormData.delete('messageId')
            disp(setHasAttechments({ trigger: false }))
            disp(setEmojiSelection({ trigger: false }))
            setMessage("");
            const chatBox = document.getElementById('chatBox');
            chatBox?.scrollBy({ top: chatBox.scrollHeight })

        } catch (error) {
            console.log(`error in send message: ${error}`);
        }
    }

    function openFileSelection(trigger: boolean) {
        if (openFilesSelection) {
            disp(setFileSelection({ trigger: false }))
        } else {
            disp(setFileSelection({ trigger: trigger }))
        }
    }

    function openEmojiSelection(trigger: boolean) {
        if (openemojiSelection) {
            disp(setEmojiSelection({ trigger: false }))
        } else {
            disp(setEmojiSelection({ trigger: trigger }))
        }
    }

    useEffect(() => {
        if (message.length) {
            socketContext.socket?.emit(ChatEventsEnum.TYPING_ON, { contactId: contact._id, searchTag: user.searchTag, avatar: user.avatar, userId: user._id });
        }
    }, [message, setMessage])

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        if (isTyping) {
            timeout = setTimeout(() => {
                disp(toggleTyping({ avatar: '', trigger: false }))
            }, 3000);
        }

        return () => {
            clearTimeout(timeout);
        };
    }, [isTyping]);

    return (
        <>
            <AttechMents />
            <UploadingMedia />
            <EmojiBox display={openemojiSelection} message={message} setMessage={setMessage} />
            <TypingIndicator trigger={isTyping.trigger} avatar={isTyping.user} />
            <section className='w-full h-[3rem] flex items-center justify-center '>
                <form id="optionsWrapper" onSubmit={sendChat} className='w-[90%] h-full grid grid-cols-[7fr_3fr] items-center content-center border-1 border-white rounded-md md:grid-cols-[10fr_1fr] md:gap-1 lg:grid-cols-[8fr_2fr] '>
                    <div className="w-full h-full flex items-center justify-center pl-2">
                        <input id="messageBox" type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder='write a message....' className="w-full h-full outline-0 text-sm text-gray-2 00 font-serif" />
                    </div>
                    <div className="h-full w-full flex justify-items-center items-center justify-center gap-1 grid-cols-[2fr_2fr_2fr] ">
                        <button type='submit' className="h-[3rem] w-full flex items-center justify-center rounded-sm c cursor-pointer md:w-[4rem] md:h-[2rem]">
                            <TiAttachmentOutline cursor={'pointer'} onClick={() => openFileSelection(true)} className='text-xl md:2xl lg:text-[25px]' />
                        </button>
                        <button type='submit' className="h-[3rem] w-full flex items-center justify-center rounded-sm c cursor-pointer md:w-[4rem] md:h-[2rem]">
                            <BsEmojiWink cursor={'pointer'} onClick={() => openEmojiSelection(true)} className='text-xl md:2xl lg:text-[25px]' />
                        </button>
                        <button type='submit' className="h-[3rem] w-full flex items-center justify-center rounded-sm c cursor-pointer md:w-[4rem] md:h-[2rem]">
                            <RiSendPlaneFill className='text-xl md:2xl lg:text-[25px]' />
                        </button>
                    </div>
                </form>
            </section>
        </>

    )
}

//emoji Box
const EmojiBox = ({ display, message, setMessage }: { display: boolean; message: string; setMessage: React.Dispatch<SetStateAction<string>> }) => {
    return (
        <EmojiPicker open={display} onEmojiClick={(e) => {
            setMessage(message + e.emoji)
        }} />
    )
}

// Attechment Box
const AttechMents = () => {
    const open = useAppSelector((state) => state.temp.fileSelection);
    const imgRef = useRef<HTMLInputElement | null>(null)
    const vidRef = useRef<HTMLInputElement | null>(null)
    const docRef = useRef<HTMLInputElement | null>(null)
    const audioRef = useRef<HTMLInputElement | null>(null)
    const disp = useAppDispatch()

    const context = useContext(AppContext)

    if (!context) {
        throw new Error("context not found")
    }

    const { handelFile } = context;

    return (
        <>
            <section className={`w-[80%] h-[8rem] ${open ? "flex" : "hidden"} overflow-auto justify-end mb-1 lg:h-[7rem] mt-1`}>
                <div className="w-[40%] h-full overflow-auto relative rounded-sm flex items-center justify-center md:w-[30%] lg:w-[20%]" style={{ scrollbarWidth: 'none' }}>
                    <div className=" bg-[#ffffff5d] w-[8rem] h-[8rem] rounded-md grid grid-cols-2 gap-4 justify-center">
                        <div className="w-full h-full flex items-center justify-center">
                            <MdOutlineImage onClick={() => {
                                disp(triggetUploadType({ tp: 'img' }))
                                imgRef.current?.click()
                                disp(setFileSelection({ trigger: false }))
                            }
                            } size={25} cursor={'pointer'} />
                        </div>
                        <div className="w-full h-full flex items-center justify-center">
                            <MdOutlineVideoLibrary onClick={() => {
                                disp(triggetUploadType({ tp: 'vid' }))
                                vidRef.current?.click()
                                disp(setFileSelection({ trigger: false }))
                            }
                            } size={25} cursor={'pointer'} />
                        </div>
                        <div className="w-full h-full flex items-center justify-center">
                            <MdOutlineAudiotrack onClick={() => {
                                disp(triggetUploadType({ tp: 'audio' }))
                                audioRef.current?.click()
                                disp(setFileSelection({ trigger: false }))
                            }} size={25} cursor={'pointer'} />
                        </div>
                        <div className="w-full h-full flex items-center justify-center">
                            <MdOutlineFileOpen onClick={() => {
                                disp(triggetUploadType({ tp: 'doc' }))
                                docRef.current?.click()
                                disp(setFileSelection({ trigger: false }))
                            }
                            } size={25} cursor={'pointer'} />
                        </div>
                    </div>
                </div>
            </section>
            <div className="hidden">
                <input onChange={(e) => handelFile(e.target.files)} ref={docRef} type="file" accept=".pdf,.doc,.docx,.txt, .css, .js, .c, .cpp, .py, .ipynb" name="" id="" />
                <input onChange={(e) => handelFile(e.target.files)} ref={imgRef} type="file" accept='image/*' />
                <input onChange={(e) => handelFile(e.target.files)} ref={vidRef} type="file" accept="video/*" max={1} name="" id="" />
                <input onChange={(e) => handelFile(e.target.files)} ref={audioRef} type="file" accept="audio/*" max={1} name="" id="" />
            </div>
        </>
    )
}

const ChatBox = () => {
    const mailOptions = useRef<HTMLDivElement | null>(null);
    const mailRef = useRef<HTMLDivElement | null>(null);
    const messages = useAppSelector((state) => state.temp.selectedContact?.messages) || [];
    const selectedContact = useAppSelector((state) => state.temp.selectedContact);
    const user = useAppSelector((state) => state.auth.user);
    const disp = useAppDispatch();

    // Reply Model
    useEffect(() => {
        const handleDoubleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const msgId = target.getAttribute("data-msgid");
            const targetTag = target.getAttribute("data-tag");
            if (msgId && targetTag) {
                disp(setReplyState({ messageId: msgId, senderTag: targetTag, trigger: true }))
                const messageArea = document.getElementById('messageBox')
                messageArea?.focus()
            }
        };

        const element = mailRef.current;
        if (element) {
            element.addEventListener("dblclick", handleDoubleClick);
        }

        // cleanup to avoid multiple listeners
        return () => {
            if (element) {
                element.removeEventListener("dblclick", handleDoubleClick);
            }
        };
    }, []);

    useEffect(() => {
        const chatViewPort = document.getElementById("chatBox")

        function getItemsInView() {
            const parentView = chatViewPort?.getBoundingClientRect();
            const msgs = chatViewPort?.children || [];

            const onViewMessages = [];

            for (const child of msgs) {
                const childRect = child.getBoundingClientRect();

                if (parentView) {
                    const isVisible = childRect.top < parentView?.bottom && childRect.bottom > parentView?.top;

                    if (isVisible) {
                        onViewMessages.push(child.attributes.getNamedItem("data-user")?.nodeValue)
                    }
                }
            }

            console.clear();
        }

        chatViewPort?.addEventListener("scroll", getItemsInView);

        getItemsInView();
    }, []);



    return (
        <section id='chatBox' className="h-full overflow-y-auto flex flex-col gap-5 p-1 pb-4" style={{ scrollbarWidth: 'none' }}>
            <MailMenu mailRef={mailOptions} boxRef={mailRef} />
            <BottomButton />
            {
                selectedContact.isGroup ? (
                    messages && messages.map((msg, index) => (
                        msg.sender?._id === user._id ? (
                            msg.pending ? (
                                <SendingMedia attechmentType={msg.attechmentType} mailRef={mailRef} readBy={msg.readBy} key={index} message={msg.message} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={"you"} mailOptions={mailOptions} time={msg.createdAt} />
                            ) : (
                                msg.isDeleted ? (
                                    <DeletedMessageMe key={index} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={"You"} time={msg.createdAt} />
                                ) : (
                                    msg.attechmentLink === "" ?
                                        <MailMe mailRef={mailRef} readBy={msg.readBy} key={index} message={msg.message} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={"you"} mailOptions={mailOptions} time={msg.createdAt} /> :
                                        <MailAttechmentMe attechmentLink={msg.attechmentLink} mailRef={mailRef} readBy={msg.readBy} key={index} message={msg.message} avatar={user.avatar} _id={msg._id} senderTag={"You"} mailOptions={mailOptions} time={msg.createdAt} />
                                )
                            )
                        ) : (
                            msg.pending || msg.isDeleted ? (
                                <DeletedMessage key={index} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={msg?.sender?.searchTag || ""} time={msg.createdAt} />
                            ) : (

                                msg.attechmentLink === "" ?
                                    <Mail mailRef={mailRef} readBy={msg.readBy} key={index} message={msg.message} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={msg?.sender?.searchTag || ""} mailOptions={mailOptions} time={msg.createdAt} /> :
                                    <MailAttechment attechmentLink={msg.attechmentLink} fileType={msg.attechmentType} mailRef={mailRef} readBy={msg.readBy} key={index} message={msg.message} avatar={user.avatar} _id={msg._id} senderTag={"You"} mailOptions={mailOptions} time={msg.createdAt} />
                            )
                        )
                    )
                    ))
                    : (
                        messages && messages.map((msg, index) => (
                            msg.userId === user._id ? (
                                msg.pending ? (
                                    <SendingMedia attechmentType={msg.attechmentType} mailRef={mailRef} readBy={msg.readBy} key={index} message={msg.message} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={"you"} mailOptions={mailOptions} time={msg.createdAt} />
                                ) : (
                                    msg.isDeleted ? (
                                        <DeletedMessageMe key={index} avatar={user.avatar || ""} _id={msg._id} senderTag={msg?.sender?.searchTag || ""} time={msg.createdAt} />
                                    ) :
                                        (
                                            msg.attechmentLink === "" ?
                                                <MailMe mailRef={mailRef} readBy={msg.readBy} key={index} message={msg.message} avatar={user.avatar} _id={msg._id} senderTag={"You"} mailOptions={mailOptions} time={msg.createdAt} /> :
                                                // Working
                                                <MailAttechmentMe attechmentLink={msg.attechmentLink} mailRef={mailRef} readBy={msg.readBy} key={index} message={msg.message} avatar={user.avatar} _id={msg._id} senderTag={"You"} mailOptions={mailOptions} time={msg.createdAt} />
                                        ))
                            ) : (
                                (
                                    msg.pending || msg.isDeleted ? (
                                        <DeletedMessage key={index} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={msg?.sender?.searchTag || ""} time={msg.createdAt} />
                                    ) :
                                        (
                                            msg.attechmentLink === "" ?
                                                <Mail mailRef={mailRef} readBy={msg.readBy} key={index} message={msg.message} avatar={user.avatar} _id={msg._id} senderTag={user.searchTag} mailOptions={mailOptions} time={msg.createdAt} /> :
                                                <MailAttechment attechmentLink={msg.attechmentLink} fileType={msg.attechmentType} mailRef={mailRef} readBy={msg.readBy} key={index} message={msg.message} avatar={user.avatar} _id={msg._id} senderTag={"You"} mailOptions={mailOptions} time={msg.createdAt} />
                                        ))
                            )

                        ))
                    )
            }

        </section>
    )
}