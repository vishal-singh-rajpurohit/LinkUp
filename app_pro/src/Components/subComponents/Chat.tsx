import g from '../../assets/no_dp.png'
import { MdOutlineAudiotrack, MdOutlineFileOpen, MdOutlineImage, MdOutlineVideoLibrary, MdVideoCall } from 'react-icons/md'
import { TiAttachmentOutline } from 'react-icons/ti'
import { RiSendPlaneFill } from 'react-icons/ri'
import { BsEmojiWink } from 'react-icons/bs'
import { BottomButton, DeletedMessage, DeletedMessageMe, ImageLightbox, Mail, MailAttechment, MailAttechmentMe, MailMe, MailMenu, SendingMedia, TypingIndicator, UploadingMedia } from './Mails'
import { FaAngleLeft, FaComments } from 'react-icons/fa'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { getTimeDifference } from '../../helpers/timeConverter'
import { NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { setEmojiSelection, setFileSelection, setHasAttechments, setReplyState, toggleTyping, triggetUploadType, uploadedMeidaTemp } from '../../app/functions/temp'
import { messageMediaSent } from '../../app/functions/auth'
import { ChatEventsEnum } from '../../context/constant'
import { AppContext, WSContext } from '../../context/Contexts'
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';
import { QUICK_EMOJIS } from '../../helpers/emojiHelper';
import messageDecryptor from '../../helpers/decryptMessage'

const api = import.meta.env.VITE_API;

export const ChatArea = () => {
    const room = useAppSelector((state) => state.temp.selectedContact)

    return (
        <section className="hidden w-full h-[100vh] md:flex items-center justify-center p-2">
            <section className="hidden flex-col items-center w-full h-[98%] glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden md:flex">
                {
                    room._id ? (
                        <>
                            <ChatTop />
                            <MailBox />
                        </>
                    ) :
                        (
                            <section className='w-full h-full flex flex-col justify-center items-center gap-4 text-center p-6 text-[var(--c-text-muted)]'>
                                <div className="p-6 rounded-full glass-card border border-white/10 text-[var(--c-accent)] shadow-2xl animate-pulse">
                                    <FaComments size={48} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-[var(--c-text-primary)]">Select a contact or group</p>
                                    <p className="text-sm max-w-sm">Choose an active conversation from the sidebar to start chatting with real-time end-to-end security.</p>
                                </div>
                            </section>
                        )
                }

            </section>
        </section>
    )
}

export const ChatTop = () => {
    const router = useNavigate();
    const room = useAppSelector((state) => state.temp.selectedContact);
    const chatTypes = useAppSelector((state) => state.temp.chatListTypes);
    const lastOnline = getTimeDifference(room?.time || Date.now());

    const socketContext = useContext(WSContext)

    if (!socketContext) {
        throw new Error("Socket context not found")
    }

    const { makeACall } = socketContext

    async function getDetails() {
        router(`/chat/details/?room_id=${room?._id}`)
    }

    return (
        <div className='h-[4.5rem] w-full glass-card px-4 border-b border-white/10 flex items-center justify-between shadow-md z-10'>
            <div className="flex items-center gap-3 min-w-0">
                <NavLink to={'/'} className="md:hidden">
                    <div className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--c-text-primary)] transition">
                        <FaAngleLeft size={18} />
                    </div>
                </NavLink>

                {/* Avatar */}
                <div onClick={getDetails} className="relative cursor-pointer shrink-0">
                    <div className='w-11 h-11 rounded-full overflow-hidden border-2 border-[var(--c-accent)] shadow-md bg-slate-700'>
                        <img src={room?.avatar || g} alt={room?.userName || "Avatar"} className="w-full h-full object-cover" />
                    </div>
                    {room?.isOnline && !room.isGroup && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                    )}
                </div>

                {/* Info */}
                <div onClick={getDetails} className="flex flex-col justify-center cursor-pointer min-w-0">
                    <p className="text-base font-bold text-[var(--c-text-primary)] truncate hover:underline">{room?.userName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--c-text-muted)]">
                        {room?.isOnline && !room.isGroup ? (
                            <span className="text-emerald-400 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Online
                            </span>
                        ) : (
                            <span>{chatTypes === 2 ? `Last message ${lastOnline}` : `Last active ${lastOnline}`}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {!room.isGroup && room.isOnline && (
                    <button
                        onClick={makeACall}
                        className="p-2.5 rounded-xl accent-bg text-black font-bold shadow-md hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer"
                        title="Start Video Call"
                    >
                        <MdVideoCall size={20} />
                        <span className="text-xs hidden lg:inline">Call</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export const MailBox = () => {
    const appContext = useContext(AppContext);
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            appContext?.handelFile(e.dataTransfer.files);
        }
    };

    return (
        <section 
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className='w-full h-full overflow-hidden flex flex-col justify-between p-2 gap-2 relative'
        >
            {isDragging && (
                <div className="absolute inset-2 z-40 rounded-2xl glass-panel border-2 border-dashed border-[var(--c-accent)] bg-black/75 backdrop-blur-md flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                    <div className="p-4 rounded-full bg-[var(--c-accent)]/20 text-[var(--c-accent)] animate-bounce">
                        <TiAttachmentOutline size={40} />
                    </div>
                    <p className="text-base font-bold text-white">Drop images or media to share</p>
                    <p className="text-xs text-[var(--c-text-muted)]">Images, videos, audio clips, and documents up to 30MB</p>
                </div>
            )}
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
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const messageInputRef = useRef<HTMLInputElement | null>(null);
    const [geoLoc] = useState<geoLocType>({
        latitude: '00',
        longitude: '00'
    })

    const socketContext = useContext(WSContext)
    const appContext = useContext(AppContext)

    if (!socketContext || !appContext) {
        throw new Error("Web socket context not found")
    }

    const { selectedFile, clearSelectedFile, handelFile } = appContext

    async function sendChat(e?: React.FormEvent<HTMLFormElement>) {
        if (e) e.preventDefault();
        if (isUploading) return;
        if (!message.trim() && !contain_files && !selectedFile) return;

        const fileToSend = selectedFile;
        const currentMsg = message;
        const hasFile = Boolean((contain_files || fileToSend) && fileToSend);
        const resolvedFileType = fileType || (
            fileToSend?.type.startsWith('video/') ? 'vid' :
            fileToSend?.type.startsWith('audio/') ? 'audio' :
            fileToSend?.type.startsWith('image/') ? 'img' : 'doc'
        );

        setMessage("");

        try {
            if (hasFile && fileToSend) {
                setIsUploading(true);
                setUploadProgress(0);
            }

            const messageResp = await axios.post<{
                data: {
                    message_id: string
                }
            }>(`${api}/chat/message/send-msg`,
                {
                    message: currentMsg,
                    contactId: contact._id,
                    longitude: geoLoc.longitude,
                    latitude: geoLoc.latitude,
                    contain_files: hasFile,
                    fileType: resolvedFileType
                },
                {
                    withCredentials: true,
                });
            const messageId = messageResp.data?.data?.message_id;

            if (hasFile && fileToSend && messageId) {
                const uploadFormData = new FormData();
                uploadFormData.append('attechment', fileToSend);
                uploadFormData.append('fileType', resolvedFileType);
                uploadFormData.append('contactId', String(contact._id));
                uploadFormData.append('messageId', String(messageId));

                const uploadResp = await axios.post<{
                    data: {
                        message: any
                    }
                }>(`${api}/chat/message/attechment-upload`,
                    uploadFormData,
                    {
                        withCredentials: true,
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                        onUploadProgress: (progressEvent) => {
                            if (progressEvent.total) {
                                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                setUploadProgress(percent);
                            }
                        }
                    }
                );

                if (uploadResp.data?.data?.message) {
                    disp(messageMediaSent({ contactId: contact._id, newMsg: uploadResp.data.data.message }));
                    disp(uploadedMeidaTemp({ contactId: contact._id, newMsg: uploadResp.data.data.message }));
                }
            }

            clearSelectedFile();
            disp(setHasAttechments({ trigger: false }));
            disp(setEmojiSelection({ trigger: false }));
            const chatBox = document.getElementById('chatBox');
            chatBox?.scrollBy({ top: chatBox.scrollHeight, behavior: 'smooth' });

        } catch (error) {
            console.error(`error in send message:`, error);
            alert("Failed to send message or attachment. Please check your connection and try again.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }

    function handleInsertEmoji(emoji: string) {
        const input = messageInputRef.current;
        if (!input) {
            setMessage((prev) => prev + emoji);
            return;
        }
        const start = input.selectionStart ?? message.length;
        const end = input.selectionEnd ?? message.length;
        const nextVal = message.slice(0, start) + emoji + message.slice(end);
        setMessage(nextVal);
        requestAnimationFrame(() => {
            input.focus();
            const newCursor = start + emoji.length;
            input.setSelectionRange(newCursor, newCursor);
        });
    }

    function openFileSelection(trigger: boolean) {
        if (openFilesSelection) {
            disp(setFileSelection({ trigger: false }))
        } else {
            disp(setFileSelection({ trigger: trigger }))
        }
    }

    function openEmojiSelection(trigger: boolean) {
        disp(setEmojiSelection({ trigger }))
    }

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (message.length) {
            if (socketContext.socket) {
                socketContext.socket.emit(ChatEventsEnum.TYPING_ON, { contactId: contact._id, searchTag: user.searchTag, avatar: user.avatar, userId: user._id });
            }
        }
    }, [message])

    useEffect(() => {
        if (isTyping) {
            timeoutRef.current = setTimeout(() => {
                disp(toggleTyping({ avatar: '', trigger: false }))
            }, 3000);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isTyping]);

    return (
        <div className="w-full flex flex-col gap-1.5 relative z-20">
            <AttechMents />
            <UploadingMedia uploadProgress={uploadProgress} isUploading={isUploading} />
            <EmojiBox 
                display={openemojiSelection} 
                onClose={() => openEmojiSelection(false)} 
                onSelectEmoji={handleInsertEmoji} 
            />
            <TypingIndicator trigger={isTyping.trigger} avatar={isTyping.user} />
            
            {/* Quick Emoji Bar for Instant Sharing */}
            <div className="flex items-center gap-1 px-1 overflow-x-auto scrollbar-none py-0.5">
                <span className="text-[10px] text-[var(--c-text-muted)] font-medium shrink-0 flex items-center gap-1 mr-1 select-none">
                    <span>✨</span> Quick:
                </span>
                {QUICK_EMOJIS.map((em, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => handleInsertEmoji(em)}
                        className="p-1 text-base rounded-lg hover:bg-white/10 hover:scale-125 active:scale-95 transition-all cursor-pointer shrink-0"
                        title={`Insert ${em}`}
                    >
                        {em}
                    </button>
                ))}
            </div>

            <section className='w-full'>
                <form 
                    id="optionsWrapper" 
                    onSubmit={sendChat} 
                    className='w-full h-12 glass-card rounded-2xl px-3 flex items-center gap-2 border border-white/15 focus-within:border-[var(--c-accent)] shadow-xl transition-all'
                >
                    <input 
                        ref={messageInputRef}
                        id="messageBox" 
                        type="text" 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        onPaste={(e) => {
                            const items = e.clipboardData?.items;
                            if (!items) return;
                            for (let i = 0; i < items.length; i++) {
                                const item = items[i];
                                if (item.kind === "file") {
                                    const file = item.getAsFile();
                                    if (file) {
                                        e.preventDefault();
                                        handelFile(file);
                                        break;
                                    }
                                }
                            }
                        }}
                        placeholder='Type a message or share media...' 
                        className="flex-1 outline-none text-sm text-[var(--c-text-primary)] placeholder:text-[var(--c-text-muted)] bg-transparent" 
                    />
                    
                    <div className="flex items-center gap-1">
                        <button 
                            id="attachButton"
                            type='button' 
                            onClick={() => openFileSelection(!openFilesSelection)}
                            className={`p-2 rounded-xl transition cursor-pointer ${
                                openFilesSelection 
                                ? 'text-[var(--c-accent)] bg-white/15' 
                                : 'text-[var(--c-text-muted)] hover:text-[var(--c-accent)] hover:bg-white/10'
                            }`}
                            title="Attach File"
                        >
                            <TiAttachmentOutline size={22} />
                        </button>
                        <button 
                            id="emojiToggleButton"
                            type='button' 
                            onClick={() => openEmojiSelection(!openemojiSelection)}
                            className={`p-2 rounded-xl transition cursor-pointer ${
                                openemojiSelection 
                                ? 'text-[var(--c-accent)] bg-white/15' 
                                : 'text-[var(--c-text-muted)] hover:text-[var(--c-accent)] hover:bg-white/10'
                            }`}
                            title="Emoji Picker"
                        >
                            <BsEmojiWink size={18} />
                        </button>
                        <button 
                            type='submit' 
                            disabled={isUploading}
                            className={`p-2 rounded-xl accent-bg text-black font-bold shadow-md transition cursor-pointer ${
                                isUploading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
                            }`}
                            title={isUploading ? "Uploading..." : "Send Message"}
                        >
                            {isUploading ? (
                                <span className="w-4.5 h-4.5 block border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <RiSendPlaneFill size={18} />
                            )}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    )
}

// Emoji Box Popover Overlay with Dark Glassmorphism, Outside-click, and Search
const EmojiBox = ({ 
    display, 
    onClose, 
    onSelectEmoji 
}: { 
    display: boolean; 
    onClose: () => void; 
    onSelectEmoji: (emoji: string) => void;
}) => {
    const boxRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!display) return;

        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('#emojiToggleButton')) return;
            if (boxRef.current && !boxRef.current.contains(target)) {
                onClose();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [display, onClose]);

    if (!display) return null;

    return (
        <div 
            ref={boxRef}
            className="absolute bottom-16 right-2 sm:right-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/15 glass-panel animate-in fade-in zoom-in-95 duration-150 max-w-[calc(100vw-1.5rem)]"
        >
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-white/10 text-xs font-semibold text-[var(--c-text-muted)]">
                <span className="flex items-center gap-1.5">
                    <span>✨</span> Emoji Sharing
                </span>
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition cursor-pointer text-xs"
                    title="Close"
                >
                    ✕
                </button>
            </div>
            <EmojiPicker 
                open={display} 
                theme={Theme.DARK}
                onEmojiClick={(e: EmojiClickData) => onSelectEmoji(e.emoji)} 
                searchDisabled={false}
                skinTonesDisabled={true}
                lazyLoadEmojis={true}
                searchPlaceHolder="Search emojis..."
                height={350}
                width={320}
            />
        </div>
    )
}

// Attachment Box Popover Overlay
const AttechMents = () => {
    const open = useAppSelector((state) => state.temp.fileSelection);
    const boxRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLInputElement | null>(null);
    const vidRef = useRef<HTMLInputElement | null>(null);
    const docRef = useRef<HTMLInputElement | null>(null);
    const audioRef = useRef<HTMLInputElement | null>(null);
    const disp = useAppDispatch();

    const context = useContext(AppContext);
    if (!context) {
        throw new Error("context not found");
    }

    const { handelFile } = context;

    useEffect(() => {
        if (!open) return;
        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('#attachButton')) return;
            if (boxRef.current && !boxRef.current.contains(target)) {
                disp(setFileSelection({ trigger: false }));
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                disp(setFileSelection({ trigger: false }));
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, disp]);

    return (
        <>
            {open && (
                <section 
                    ref={boxRef}
                    className="absolute bottom-16 right-4 sm:right-16 z-50 animate-in fade-in zoom-in-95 duration-150 max-w-[calc(100vw-2rem)]"
                >
                    <div className="glass-panel p-3 rounded-2xl shadow-2xl border border-white/15 grid grid-cols-4 gap-2.5 sm:gap-3">
                        <button 
                            type="button"
                            onClick={() => {
                                disp(triggetUploadType({ tp: 'img' }));
                                imgRef.current?.click();
                                disp(setFileSelection({ trigger: false }));
                            }}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10 transition cursor-pointer"
                        >
                            <MdOutlineImage size={24} />
                            <span className="text-[10px] font-medium">Image</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                disp(triggetUploadType({ tp: 'vid' }));
                                vidRef.current?.click();
                                disp(setFileSelection({ trigger: false }));
                            }}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white/5 hover:bg-sky-500/20 hover:text-sky-400 border border-white/10 transition cursor-pointer"
                        >
                            <MdOutlineVideoLibrary size={24} />
                            <span className="text-[10px] font-medium">Video</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                disp(triggetUploadType({ tp: 'audio' }));
                                audioRef.current?.click();
                                disp(setFileSelection({ trigger: false }));
                            }}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 border border-white/10 transition cursor-pointer"
                        >
                            <MdOutlineAudiotrack size={24} />
                            <span className="text-[10px] font-medium">Audio</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                disp(triggetUploadType({ tp: 'doc' }));
                                docRef.current?.click();
                                disp(setFileSelection({ trigger: false }));
                            }}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 border border-white/10 transition cursor-pointer"
                        >
                            <MdOutlineFileOpen size={24} />
                            <span className="text-[10px] font-medium">Doc</span>
                        </button>
                    </div>
                </section>
            )}

            {/* Inputs are permanently mounted in the DOM so they never unmount while file dialog is active */}
            <div className="hidden">
                <input 
                    onChange={(e) => {
                        handelFile(e.target.files, 'doc');
                        e.target.value = '';
                    }} 
                    ref={docRef} 
                    type="file" 
                    accept=".pdf,.doc,.docx,.txt,.css,.js,.ts,.tsx,.json,.c,.cpp,.py,.ipynb,.zip" 
                />
                <input 
                    onChange={(e) => {
                        handelFile(e.target.files, 'img');
                        e.target.value = '';
                    }} 
                    ref={imgRef} 
                    type="file" 
                    accept="image/*" 
                />
                <input 
                    onChange={(e) => {
                        handelFile(e.target.files, 'vid');
                        e.target.value = '';
                    }} 
                    ref={vidRef} 
                    type="file" 
                    accept="video/*" 
                />
                <input 
                    onChange={(e) => {
                        handelFile(e.target.files, 'audio');
                        e.target.value = '';
                    }} 
                    ref={audioRef} 
                    type="file" 
                    accept="audio/*" 
                />
            </div>
        </>
    );
};

const ChatBox = () => {
    const mailOptions = useRef<HTMLDivElement | null>(null);
    const chatBoxRef = useRef<HTMLDivElement | null>(null);

    const messages = useAppSelector((s) => s.temp.selectedContact?.messages) || [];
    const selectedContact = useAppSelector((s) => s.temp.selectedContact);
    const user = useAppSelector((s) => s.auth.user);
    const disp = useAppDispatch();

    const [menu, setMenu] = useState({
        visible: false,
        x: 0,
        y: 0,
    });

    const openMenu = (x: number, y: number) => {
        setMenu({ visible: true, x, y });
    };

    const closeMenu = () => {
        setMenu({ visible: false, x: 0, y: 0 });
    };

    const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const decryptedSetRef = useRef<Set<string>>(new Set());

    const wscontext = useContext(WSContext)

    if (!wscontext) {
        throw new Error("WsContext not found")
    }

    async function decryptAndStore(msgId: string, cipherText: string) {
        try {
            if (!cipherText || cipherText.trim() === "") {
                setDecryptedMap((m) => {
                    if (m[msgId] === "") return m;
                    return { ...m, [msgId]: "" };
                });
                return;
            }
            const plain = await messageDecryptor(cipherText);
            const plainText = plain ? plain.toString() : cipherText;
            setDecryptedMap((m) => {
                if (m[msgId] === plainText) return m;
                return { ...m, [msgId]: plainText };
            });
        } catch {
            setDecryptedMap((m) => {
                if (m[msgId] === cipherText) return m;
                return { ...m, [msgId]: cipherText };
            });
        }
    }

    useEffect(() => {
        const root = chatBoxRef.current;
        if (!root) return;

        const handleDoubleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const msgEl = target.closest("[data-msgid]") as HTMLElement | null;
            if (!msgEl) return;

            const msgId = msgEl.dataset.msgid;
            const tag = msgEl.dataset.tag;
            if (!msgId || !tag) return;

            disp(setReplyState({ messageId: msgId, senderTag: tag, trigger: true }));
            document.getElementById("messageBox")?.focus();
        };

        root.addEventListener("dblclick", handleDoubleClick);
        return () => root.removeEventListener("dblclick", handleDoubleClick);
    }, [disp]);

    useEffect(() => {
        const root = chatBoxRef.current;
        if (!root) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;

                    const el = entry.target as HTMLElement;
                    const msgId = el.dataset.msgid;
                    const cipherText = el.dataset.cipher;

                    if (msgId && cipherText && !decryptedSetRef.current.has(msgId)) {
                        decryptedSetRef.current.add(msgId);
                        decryptAndStore(msgId, cipherText);
                    }

                    const isUnread = el.dataset.read;
                    const sender_search_tag = el.dataset.tag;

                    if (typeof isUnread !== 'undefined' && sender_search_tag !== 'You') {
                        wscontext.socket?.emit(ChatEventsEnum.MARK_READ, { id: user._id, msgid: msgId })
                    }
                    observer.unobserve(el);
                }
            },
            { root, threshold: 0.5 }
        );

        const nodes = root.querySelectorAll<HTMLElement>("[data-msgid]");

        nodes.forEach((n) => {
            const msgId = n.dataset.msgid;
            if (!msgId || decryptedSetRef.current.has(msgId)) return;
            observer.observe(n);
        });

        return () => observer.disconnect();
    }, [messages]);

    return (
        <section
            id="chatBox"
            ref={chatBoxRef}
            className="flex-1 overflow-y-auto flex flex-col gap-3 p-3 scroll-smooth"
        >
            <MailMenu 
                visible={menu.visible}
                x={menu.x}
                y={menu.y}
                onClose={closeMenu} 
            />
            <BottomButton />

            {
                selectedContact.isGroup ? (
                    messages && messages.map((msg, index) => {
                        const cipherText = msg.message;
                        const displayText = decryptedMap[msg._id] ?? "Decrypting...";

                        return (
                            msg.sender?._id === user._id ? (
                                msg.pending ? (
                                    <SendingMedia cipherText={cipherText} displayText={displayText} attechmentType={msg.attechmentType} mailRef={mailOptions} readBy={msg.readBy} key={msg._id || index} message={msg.message} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={"you"} mailOptions={mailOptions} time={msg.createdAt} />
                                ) : (
                                    msg.isDeleted ? (
                                        <DeletedMessageMe key={msg._id || index} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={"You"} time={msg.createdAt} />
                                    ) : (
                                        (msg.attechmentLink && msg.attechmentLink !== "") ?
                                            <MailAttechmentMe mailOptionsHandler={(x, y) => openMenu(x, y)} cipherText={cipherText} displayText={displayText} attechmentLink={msg.attechmentLink} fileType={msg.attechmentType} mailRef={mailOptions} readBy={msg.readBy} key={msg._id || index} message={msg.message} avatar={user.avatar} _id={msg._id} senderTag={"You"} mailOptions={mailOptions} time={msg.createdAt} onImageClick={setLightboxUrl} /> :
                                            <MailMe mailOptionsHandler={(x, y) => openMenu(x, y)} cipherText={cipherText} displayText={displayText} mailRef={mailOptions} readBy={msg.readBy} key={msg._id || index} message={msg.message} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={"you"} time={msg.createdAt} />
                                    )
                                )
                            ) : (
                                msg.pending || msg.isDeleted ? (
                                    <DeletedMessage key={msg._id || index} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={msg?.sender?.searchTag || ""} time={msg.createdAt} />
                                ) : (
                                    (msg.attechmentLink && msg.attechmentLink !== "") ?
                                        <MailAttechment mailOptionsHandler={(x, y) => openMenu(x, y)} cipherText={cipherText} displayText={displayText} attechmentLink={msg.attechmentLink} fileType={msg.attechmentType} mailRef={mailOptions} readBy={msg.readBy} key={msg._id || index} message={msg.message} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={msg?.sender?.searchTag || "Member"} mailOptions={mailOptions} time={msg.createdAt} onImageClick={setLightboxUrl} /> :
                                        <Mail cipherText={cipherText} displayText={displayText} mailOptions={mailOptions} readBy={msg.readBy} key={msg._id || index} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={msg?.sender?.searchTag || ""} time={msg.createdAt} />
                                )
                            )
                        );
                    })
                ) : (
                    messages && messages.map((msg, index) => {
                        const cipherText = msg.message;
                        const displayText = decryptedMap[msg._id] ?? "Decrypting...";

                        return (
                            (msg.userId === user._id || msg.sender?._id === user._id) ? (
                                msg.pending ? (
                                    <SendingMedia cipherText={cipherText} displayText={displayText} attechmentType={msg.attechmentType} mailRef={mailOptions} readBy={msg.readBy} key={msg._id || index} message={msg.message} avatar={msg?.sender?.avatar || ""} _id={msg._id} senderTag={"you"} mailOptions={mailOptions} time={msg.createdAt} />
                                ) : (
                                    msg.isDeleted ? (
                                        <DeletedMessageMe key={msg._id || index} avatar={user.avatar || ""} _id={msg._id} senderTag={msg?.sender?.searchTag || ""} time={msg.createdAt} />
                                    ) : (
                                        (msg.attechmentLink && msg.attechmentLink !== "") ?
                                            <MailAttechmentMe mailOptionsHandler={(x, y) => openMenu(x, y)} cipherText={cipherText} displayText={displayText} attechmentLink={msg.attechmentLink} fileType={msg.attechmentType} mailRef={mailOptions} readBy={msg.readBy} key={msg._id || index} message={msg.message} avatar={user.avatar} _id={msg._id} senderTag={"You"} mailOptions={mailOptions} time={msg.createdAt} onImageClick={setLightboxUrl} /> :
                                            <MailMe mailOptionsHandler={(x, y) => openMenu(x, y)} cipherText={cipherText} displayText={displayText} mailRef={mailOptions} readBy={msg.readBy} key={msg._id || index} message={msg.message} avatar={user.avatar} _id={msg._id} senderTag={"You"} time={msg.createdAt} />
                                    )
                                )
                            ) : (
                                (msg.pending || msg.isDeleted) ? (
                                    <DeletedMessage key={msg._id || index} avatar={msg?.sender?.avatar || selectedContact.avatar || ""} _id={msg._id} senderTag={msg?.sender?.searchTag || selectedContact.searchTag || ""} time={msg.createdAt} />
                                ) : (
                                    (msg.attechmentLink && msg.attechmentLink !== "") ?
                                        <MailAttechment mailOptionsHandler={(x, y) => openMenu(x, y)} cipherText={cipherText} displayText={displayText} attechmentLink={msg.attechmentLink} fileType={msg.attechmentType} mailRef={mailOptions} readBy={msg.readBy} key={msg._id || index} message={msg.message} avatar={selectedContact.avatar || ""} _id={msg._id} senderTag={selectedContact.searchTag || "Contact"} mailOptions={mailOptions} time={msg.createdAt} onImageClick={setLightboxUrl} /> :
                                        <Mail cipherText={cipherText} displayText={displayText} mailOptions={mailOptions} readBy={msg.readBy} key={msg._id || index} avatar={selectedContact.avatar || ""} _id={msg._id} senderTag={selectedContact.searchTag || "Contact"} time={msg.createdAt} />
                                )
                            )
                        );
                    })
                )
            }
            <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
        </section>
    );
};
