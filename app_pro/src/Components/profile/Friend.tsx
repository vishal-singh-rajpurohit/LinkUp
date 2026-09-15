import { BiBlock, BiExit, BiUserCircle } from "react-icons/bi"
import { FaAngleLeft } from "react-icons/fa"
import { HiLocationMarker } from "react-icons/hi"
import { RiArchive2Line } from "react-icons/ri"
import { NavLink, useNavigate } from "react-router-dom"
import x from '../../assets/no_dp.png'
import axios from 'axios'
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { addArchieved, blockTrigger, kickoutAuth, removeArchieved, type contactTypes } from "../../app/functions/auth"
import { blockSelected, clearTemp, contactListingFunction, kickoutTemp, setAddGroupModal, setKickoutModal, setKickoutWarning, setTempString, setTempUser } from "../../app/functions/temp"
import { GrDown, GrUp } from "react-icons/gr"
import React, { useContext, useEffect, useRef, useState } from "react"
import { ContactItem } from "../subComponents/Contact"
import { GiKickScooter } from "react-icons/gi"
import { AppContext } from "../../context/Contexts"
import { SampleCropper2 } from "../Cropper/Cropper"
import { CheckCircle } from "lucide-react"

const env = import.meta.env.VITE_API

const SelectContactItem = ({ searchTag, avatar, userId }: {
    searchTag: string,
    avatar: string,
    userId: string,
    _id?: string,
}) => {
    const disp = useAppDispatch()
    const tempUsers = useAppSelector((state) => state.temp.tempUser)
    const [isSelected, setIsSelected] = useState<boolean>(false)

    async function select() {
        disp(setTempUser({
            contacts: {
                _id: userId,
                avatar: avatar,
                searchTag: searchTag,
                userId: userId
            }
        }))

        const isSel = tempUsers.filter((val) => val._id === userId)
        setIsSelected(!(Boolean(isSel.length)));
    }

    return (
        <div 
            onClick={() => select()} 
            className={`w-full h-14 rounded-xl cursor-pointer transition-all duration-200 flex items-center px-3 gap-3 border ${
                isSelected ? 'bg-[var(--c-accent)]/20 border-[var(--c-accent)]' : 'glass-card border-white/10 hover:bg-white/10'
            }`}
        >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0">
                <img src={avatar || x} alt="" className="w-full h-full object-cover" />
                {isSelected && (
                    <div className="absolute inset-0 bg-[var(--c-accent)]/40 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--c-text-primary)] truncate">{searchTag}</p>
            </div>
        </div>
    )
}

const AddMemberModel = () => {
    const disp = useAppDispatch()
    const selectedContact = useAppSelector((state) => state.temp.selectedContact);
    const tempUsers = useAppSelector((state) => state.temp.tempUser)
    const contacts = useAppSelector((state) => state.auth.contacts)
    const open = useAppSelector((state) => state.temp.activeAddToGroup)
    const [filteredUsers, setFilteredUser] = useState<contactTypes[]>([])

    async function addNewMember() {
        if (tempUsers.length) {
            try {
                await axios.post(`${env}/chat/add-to-group`, {
                    members: tempUsers,
                    contactId: selectedContact?._id
                }, {
                    withCredentials: true
                })
                disp(clearTemp())
                setFilteredUser([])
                disp(setAddGroupModal({ trigger: false }))
                window.location.pathname = "/"
            } catch (error) {
                console.log(`error in adding error ${error}`);
            }
        }
    }

    useEffect(() => {
        let temp: contactTypes[] = contacts;
        function getFiltered() {
            selectedContact?.members?.forEach((member) => {
                temp = temp.filter((val) => val.searchTag !== member.searchTag)
                setFilteredUser(temp)
            })
        }
        getFiltered()
    }, [contacts, selectedContact])

    if (!open) return null;

    return (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl glass-panel shadow-2xl overflow-hidden border border-white/15">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h3 className="text-base font-bold text-[var(--c-text-primary)]">Add Members</h3>
                    <div className="flex gap-2">
                        <button 
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer" 
                            onClick={() => disp(setAddGroupModal({ trigger: false }))}
                        >
                            Cancel
                        </button>
                        <button 
                            className="px-3 py-1.5 rounded-xl accent-bg text-black font-bold text-xs shadow-md hover:brightness-110 transition disabled:opacity-50 cursor-pointer" 
                            disabled={tempUsers.length < 1} 
                            onClick={addNewMember}
                        >
                            Add ({tempUsers.length})
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                    {filteredUsers.length ? (
                        filteredUsers.map((user, index) => (
                            <SelectContactItem userId={user.userId} key={index} _id={user._id} avatar={user.avatar} searchTag={user.searchTag} />
                        ))
                    ) : (
                        <p className="text-xs text-[var(--c-text-muted)] text-center py-6">All available contacts are already in this group</p>
                    )}
                </div>
            </div>
        </section>
    )
}

const KickoutUsers = ({ _id, searchTag, avatar }: {
    _id: string,
    searchTag: string,
    avatar: string,
    userId?: string
}) => {
    const disp = useAppDispatch()

    const select = () => {
        disp(setTempString({ text: _id }))
        disp(setKickoutWarning({ trigger: true }))
    }

    return (
        <div 
            onClick={() => select()} 
            className="w-full h-14 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-between px-3 glass-card border border-white/10 hover:border-red-500/40 hover:bg-red-500/10 group"
        >
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0">
                    <img src={avatar || x} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-semibold text-[var(--c-text-primary)] truncate">{searchTag}</p>
            </div>
            <span className="text-xs font-bold text-red-400 group-hover:underline">Kick Out</span>
        </div>
    )
}

const KickOutWarning = () => {
    const disp = useAppDispatch()
    const selectedContact = useAppSelector((state) => state.temp.selectedContact)
    const tempId = useAppSelector((state) => state.temp.tempString)
    const open = useAppSelector((state) => state.temp.kickOutWarning)

    async function kick() {
        if (selectedContact) {
            try {
                await axios.post(`${env}/chat/kickout-from-group`, {
                    memberId: tempId,
                    contactId: selectedContact?._id
                }, {
                    withCredentials: true
                })

                disp(kickoutTemp({ text: tempId }))
                disp(kickoutAuth({ id: tempId, conId: selectedContact._id }))
                disp(setKickoutWarning({ trigger: false }))

            } catch (error) {
                console.log(`error in adding error ${error}`);
            }
        }
    }

    if (!open) return null;

    return (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-white/15 text-center space-y-4">
                <div className="text-amber-400 font-extrabold text-lg">Remove Member?</div>
                <p className="text-xs text-[var(--c-text-muted)]">This user will be permanently kicked out of the group conversation.</p>
                
                <div className="flex gap-2 w-full pt-2">
                    <button className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer" onClick={kick}>
                        Confirm Kick Out
                    </button>
                    <button className="flex-1 h-10 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition cursor-pointer" onClick={() => disp(setKickoutWarning({ trigger: false }))}>
                        Cancel
                    </button>
                </div>
            </div>
        </section>
    )
}

const KickoutModel = () => {
    const disp = useAppDispatch()
    const selectedContact = useAppSelector((state) => state.temp.selectedContact);
    const open = useAppSelector((state) => state.temp.kickOutGroup);

    if (!open) return null;

    return (
        <>
            <KickOutWarning />
            <section className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-md rounded-3xl glass-panel shadow-2xl overflow-hidden border border-white/15">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                        <h3 className="text-base font-bold text-[var(--c-text-primary)]">Kick Out Members</h3>
                        <button 
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer" 
                            onClick={() => disp(setKickoutModal({ trigger: false }))} 
                        >
                            Close
                        </button>
                    </div>
                    <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                        {selectedContact?.members && selectedContact?.members.map((user, index) => (
                            <KickoutUsers key={index} _id={user._id} avatar={user.avatar} searchTag={user.searchTag} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

const Friend = () => {
    const router = useNavigate()
    const disp = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user)
    const contact = useAppSelector((state) => state.temp.selectedContact)
    const chatType = useAppSelector((state) => state.temp.chatListTypes)

    const context = useContext(AppContext)

    if (!context) {
        throw new Error('context not found')
    }

    const { isAdmin } = context;

    const [showMembers, setShowMembers] = useState<boolean>(false);
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const [tempAvatar, setTempAvatar] = useState<string>("");
    const avatarRef = useRef<HTMLInputElement | null>(null)

    async function block_left() {
        try {
            await axios.post(`${env}/chat/block-left`, {
                contactId: contact?._id
            }, { withCredentials: true });

            if (contact?._id) {
                disp(blockTrigger({ id: contact._id, isGroup: contact?.isGroup || false, trigger: true }))
                disp(blockSelected({ trigger: true }))
            }

            if (contact?.isGroup) {
                router('/')
            }

        } catch (error) {
            console.log(`error in block function ${error}`);
        }
    }

    async function ub_block() {
        try {
            await axios.post(`${env}/chat/un-block`, {
                contactId: contact?._id
            }, { withCredentials: true });

            if (contact?._id) {
                disp(blockTrigger({ id: contact._id, isGroup: false, trigger: false }))
                disp(blockSelected({ trigger: false }))
            }

        } catch (error) {
            console.log(`error in block function ${error}`);
        }
    }

    async function archiev() {
        try {
            if (contact?._id) {
                await axios.post(`${env}/chat/archieve`, {
                    contactId: contact._id
                }, { withCredentials: true });

                disp(addArchieved({ _id: contact?._id }))
                disp(contactListingFunction({ trigger: 3 }))
            }

        } catch (error) {
            console.log(`errir in archieve ${error}`);
        }
    }

    async function unArchiev() {
        try {
            if (contact?._id) {
                await axios.post(`${env}/chat/un-archieve`, {
                    contactId: contact._id
                }, { withCredentials: true });

                disp(removeArchieved({ _id: contact?._id }))
                disp(contactListingFunction({ trigger: 1 }))
            }

        } catch (error) {
            console.log(`errir in archieve ${error}`);
        }
    }

    function clickAvatar() {
        if (contact.isGroup && isAdmin) {
            avatarRef.current?.click()
        }
    }

    async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (e.target.files && file) {
            const render = new FileReader()
            render.onload = () => {
                if (typeof render.result === 'string')
                    setTempAvatar(render.result)
            }
            render.readAsDataURL(file)
        }
    }

    useEffect(() => {
        if (tempAvatar) {
            setShowEditor(true)
        } else {
            setShowEditor(false)
        }
    }, [tempAvatar])

    return (
        <>
            <SampleCropper2 contactId={contact._id} open={showEditor} image={tempAvatar} setImage={setTempAvatar} />
            <AddMemberModel />
            <KickoutModel />
            
            <section className="w-full min-h-screen py-4 flex justify-center overflow-y-auto">
                <section className="w-[95%] lg:w-[80%] max-w-5xl glass-panel rounded-3xl border border-white/10 shadow-2xl p-4 md:p-6 space-y-6">
                    {/* Top Navigation */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <NavLink to={'/'} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--c-text-primary)] transition">
                                <FaAngleLeft size={20} />
                            </NavLink>
                            <div>
                                <h1 className="text-xl font-bold text-[var(--c-text-primary)]">{contact?.isGroup ? 'Group Information' : 'Contact Profile'}</h1>
                                <p className="text-xs text-[var(--c-text-muted)]">View details and manage actions</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Profile Overview */}
                    <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col items-center text-center space-y-4">
                        <div className="relative group cursor-pointer" onClick={clickAvatar}>
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[var(--c-accent)] shadow-2xl bg-slate-700">
                                <img src={contact?.avatar || x} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            {contact?.isGroup && isAdmin && (
                                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                                    Change Logo
                                </div>
                            )}
                            <input type="file" accept="image/*" className="hidden" ref={avatarRef} onChange={handleAvatar} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-extrabold text-[var(--c-text-primary)]">{contact?.userName || contact?.searchTag}</h2>
                            <div className="flex items-center justify-center gap-1 text-xs text-[var(--c-text-muted)] mt-1">
                                <HiLocationMarker size={14} className="accent-text" />
                                <span>NY, New York City</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-white/10">
                            <div className="glass-card p-3 rounded-xl border border-white/10 text-center">
                                <p className="text-xs font-semibold text-[var(--c-text-primary)] truncate">{contact?.isGroup ? `${contact?.members?.length || 0} Members` : (contact?.email || 'N/A')}</p>
                                <p className="text-[10px] text-[var(--c-text-muted)] uppercase tracking-wider">{contact?.isGroup ? 'Group Members' : 'Email Address'}</p>
                            </div>
                            <div className="glass-card p-3 rounded-xl border border-white/10 text-center">
                                <p className="text-xs font-semibold text-[var(--c-text-primary)] truncate">{contact?.searchTag || user.searchTag}</p>
                                <p className="text-[10px] text-[var(--c-text-muted)] uppercase tracking-wider">Search Tag</p>
                            </div>
                        </div>
                    </div>

                    {/* Accordion: Group Members */}
                    {contact?.isGroup && (
                        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                            <button 
                                onClick={() => setShowMembers(!showMembers)} 
                                className="w-full px-5 py-3.5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition"
                            >
                                <span className="text-sm font-bold text-[var(--c-text-primary)]">Group Members ({contact.members?.length || 0})</span>
                                {showMembers ? <GrUp size={14} className="text-[var(--c-text-muted)]" /> : <GrDown size={14} className="text-[var(--c-text-muted)]" />}
                            </button>

                            {showMembers && (
                                <div className="p-3 border-t border-white/10 space-y-1 max-h-60 overflow-y-auto">
                                    {contact.members?.map((member, index) => (
                                        <ContactItem _id={member._id} avatar={member.avatar} searchTag={member.searchTag} key={index} isOnline={member.isOnline} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions List */}
                    <div className="space-y-2">
                        {chatType === 3 ? (
                            <div 
                                onClick={unArchiev} 
                                className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition"
                            >
                                <div className="p-2.5 rounded-xl accent-bg text-black shadow-md"><RiArchive2Line size={20} /></div>
                                <div>
                                    <p className="text-sm font-bold text-[var(--c-text-primary)]">Unarchive Chat</p>
                                    <p className="text-xs text-[var(--c-text-muted)]">Restore this conversation to main list</p>
                                </div>
                            </div>
                        ) : (
                            chatType !== 2 && (
                                <div 
                                    onClick={archiev} 
                                    className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition"
                                >
                                    <div className="p-2.5 rounded-xl accent-bg text-black shadow-md"><RiArchive2Line size={20} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-[var(--c-text-primary)]">Archive Chat</p>
                                        <p className="text-xs text-[var(--c-text-muted)]">Move conversation to archived folder</p>
                                    </div>
                                </div>
                            )
                        )}

                        {contact?.isGroup && isAdmin && (
                            <>
                                <div 
                                    onClick={() => disp(setAddGroupModal({ trigger: true }))} 
                                    className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition"
                                >
                                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><BiUserCircle size={20} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-[var(--c-text-primary)]">Add Members</p>
                                        <p className="text-xs text-[var(--c-text-muted)]">Invite new participants to group</p>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => disp(setKickoutModal({ trigger: true }))} 
                                    className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition"
                                >
                                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30"><GiKickScooter size={20} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-[var(--c-text-primary)]">Kick Out Members</p>
                                        <p className="text-xs text-[var(--c-text-muted)]">Remove members from group</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {!contact?.email ? (
                            <div 
                                onClick={block_left} 
                                className="glass-card p-4 rounded-2xl border border-red-500/20 flex items-center gap-3 cursor-pointer hover:bg-red-500/10 transition"
                            >
                                <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30"><BiExit size={20} /></div>
                                <div>
                                    <p className="text-sm font-bold text-red-400">Leave Group</p>
                                    <p className="text-xs text-[var(--c-text-muted)]">Exit this group conversation</p>
                                </div>
                            </div>
                        ) : (
                            contact.isBlocked ? (
                                <div 
                                    onClick={ub_block} 
                                    className="glass-card p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-3 cursor-pointer hover:bg-emerald-500/10 transition"
                                >
                                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><BiBlock size={20} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-400">Unblock User</p>
                                        <p className="text-xs text-[var(--c-text-muted)]">Allow messages from this user</p>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    onClick={block_left} 
                                    className="glass-card p-4 rounded-2xl border border-red-500/20 flex items-center gap-3 cursor-pointer hover:bg-red-500/10 transition"
                                >
                                    <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30"><BiBlock size={20} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-red-400">Block User</p>
                                        <p className="text-xs text-[var(--c-text-muted)]">Stop receiving messages from this contact</p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </section>
            </section>
        </>
    )
}

export default Friend