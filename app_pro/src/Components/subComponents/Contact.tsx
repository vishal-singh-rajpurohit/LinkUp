import { CiCirclePlus, CiSearch, CiSettings } from 'react-icons/ci'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { setSearching } from '../../app/functions/triggers'
import axios from 'axios'
import { appendGroupAdmin, appendGroupContact, clearGroupContact, contactListingFunction, openGroupChat, searching, type groupContactTypes, type searchUserTypes } from '../../app/functions/temp'
import { saveContact, type groupsResp, type newChatTypes } from '../../app/functions/auth'
import { getTimeDifference } from '../../helpers/timeConverter'
import { AppContext, WSContext } from '../../context/Contexts'
import { useTheme, type ThemePreset } from '../../context/ThemeContext'
import { FaArchive, FaUserFriends, FaPalette, FaCheck } from 'react-icons/fa'
import { MdGroups } from 'react-icons/md'
import { SampleCropper3 } from '../Cropper/Cropper'
import { CheckCircle } from 'lucide-react'

import g from '../../assets/no_dp.png'
const api = import.meta.env.VITE_API

export const ContactItem = ({ _id, searchTag, avatar, lastMessage = "start talking", time = null, isOnline }: {
    _id: string,
    searchTag: string,
    avatar: string,
    lastMessage?: string,
    time?: Date | null | number,
    isOnline: boolean
}) => {
    const context = useContext(AppContext)
    const socketContext = useContext(WSContext)

    if (!context || !socketContext) {
        throw new Error('context not found')
    }

    const { selectToTalk } = context;

    const disp = useAppDispatch()
    const router = useNavigate()
    const isSearching = useAppSelector((state) => state.triggers.searching)
    const contacts = useAppSelector((state) => state.auth.contacts)
    const selectedContact = useAppSelector((state) => state.temp.selectedContact)
    const [timer, setTimer] = useState<string>("")

    const isSelected = selectedContact?._id === _id;

    useEffect(() => {
        if (time) {
            const currTime: string = getTimeDifference(time)
            setTimer(currTime)
        }
    }, [contacts, isSearching, time])

    function talk(id: string = _id) {
        if (window.innerWidth < 768) {
            selectToTalk(id)
            router(`/chat?id=${id}`)
        } else {
            selectToTalk(id)
        }
    }

    async function select() {
        if (isSearching) {
            try {
                interface respTypes {
                    data: {
                        newContact: newChatTypes
                    }
                }

                const resp = await axios.post<respTypes>(`${api}/chat/save-contact`,
                    { reciverId: _id },
                    { withCredentials: true }
                )

                window.location.reload();
                disp(saveContact({ newChat: resp.data.data.newContact }));
                disp(setSearching({ trigger: false }));
                talk(resp.data.data.newContact._id);

            } catch (error) { }
        } else {
            talk(_id);
        }
    }

    return (
        <div 
            onClick={() => select()} 
            className={`w-full my-1 rounded-xl cursor-pointer transition-all duration-200 ${
                isSelected 
                ? 'bg-white/10 shadow-lg border border-white/15' 
                : 'hover:bg-white/5 border border-transparent'
            }`}
        >
            <div className="grid h-[4.2rem] grid-cols-[0.8fr_5fr_1.5fr] items-center px-3 gap-2">
                {/* Avatar with Online Pulse Badge */}
                <div className="relative flex items-center justify-center">
                    <div className='w-[2.8rem] h-[2.8rem] flex items-center justify-center overflow-hidden rounded-full border border-white/10 shadow-md bg-slate-700/50'>
                        <img src={avatar || g} alt={searchTag} className="w-full h-full object-cover" />
                    </div>
                    {isOnline && (
                        <span className="absolute bottom-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
                        </span>
                    )}
                </div>

                {/* Tag & Message */}
                <div className="flex flex-col justify-center min-w-0">
                    <p className="text-[14px] font-semibold text-[var(--c-text-primary)] truncate">{searchTag}</p>
                    <p className="text-[12px] text-[var(--c-text-muted)] truncate">{lastMessage || "Click to open chat"}</p>
                </div>

                {/* Time Badge */}
                <div className="flex flex-col items-end justify-center">
                    <span className="text-[10px] text-[var(--c-text-muted)] font-medium">{timer || ""}</span>
                </div>
            </div>
        </div>
    )
}

export const NoContacts = () => {
    return (
        <div className="w-full h-32 flex flex-col items-center justify-center gap-2 text-[var(--c-text-muted)]">
            <p className="text-base font-medium">No conversations found</p>
            <p className="text-xs opacity-75">Search for contacts or create a new group</p>
        </div>
    )
}

const SelectContactItem = ({ _id, searchTag, avatar, userId }: {
    _id: string,
    searchTag: string,
    avatar: string,
    userId: string
}) => {
    const disp = useAppDispatch()
    const groupContact = useAppSelector((state) => state.temp.groupContact)
    const [isSelected, setIsSelected] = useState<boolean>(false)

    async function select(id: string) {
        disp(appendGroupContact({
            user: {
                _id,
                userId: userId,
                avatar,
                searchTag,
            }
        }));

        const sel: groupContactTypes[] = groupContact.filter((val) => val._id === id)
        setIsSelected(!sel.length);
    }

    return (
        <div 
            onClick={() => select(_id)} 
            className={`h-[3.8rem] rounded-xl cursor-pointer transition-all duration-200 flex items-center px-3 gap-3 border ${
                isSelected ? 'bg-[var(--c-accent)]/20 border-[var(--c-accent)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
        >
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                <img src={avatar || g} alt="" className="w-full h-full object-cover" />
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

const AdminSelect = ({ _id, searchTag, avatar, userId }: {
    _id: string,
    searchTag: string,
    avatar: string,
    userId: string
}) => {
    const disp = useAppDispatch()
    const groupContact = useAppSelector((state) => state.temp.groupContact)
    const [isSelected, setIsSelected] = useState<boolean>(false)

    async function select(id: string) {
        disp(appendGroupAdmin({
            user: {
                _id,
                avatar,
                userId,
                searchTag,
            }
        }));

        const sel: groupContactTypes[] = groupContact.filter((val) => val._id === id)
        setIsSelected((Boolean(sel.length)));
    }

    return (
        <div 
            onClick={() => select(_id)} 
            className={`h-[3.5rem] rounded-xl cursor-pointer transition-all duration-200 flex items-center px-3 gap-3 border ${
                isSelected ? 'bg-emerald-500/20 border-emerald-400' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
        >
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0">
                <img src={avatar || g} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--c-text-primary)] truncate">{searchTag}</p>
            </div>
            {isSelected && <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">Admin</span>}
        </div>
    )
}

const SelectedContacts = ({ avatar, admin }: {
    avatar: string;
    admin?: boolean;
}) => {
    return (
        <section className="cursor-pointer">
            <div className={`w-[2.5rem] h-[2.5rem] rounded-full overflow-hidden shadow-md ${admin ? 'ring-2 ring-emerald-400' : 'ring-1 ring-white/20'}`}>
                <img src={avatar || g} alt="" className="w-full h-full object-cover" />
            </div>
        </section>
    )
}

interface newGroupTypes {
    data: {
        newGroupDetails: groupsResp
    }
}

const CreateGroupChat = () => {
    const disp = useAppDispatch();
    const display = useAppSelector((state) => state.temp.activeGroup);
    const contacts = useAppSelector((state) => state.auth.contacts);
    const selectedGroupContacts = useAppSelector((state) => state.temp.groupContact);

    const avatarRef = useRef<HTMLInputElement | null>(null);

    const [tempAvatar, setTempAvatar] = useState<string>("");
    const [temp_pid, setTemp_pid] = useState<string>("");
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const [doneSelecting, setDoneSelecting] = useState<boolean>(false);
    const [whoCanSend, setWhoCanSet] = useState<string>("anyone");

    const [custErr, setCustErr] = useState<{ message: string; on: number }>({
        message: "",
        on: 0,
    });

    const [formData, setFormData] = useState<{ groupName: string; description: string }>({
        groupName: "",
        description: "",
    });

    const membersCount = selectedGroupContacts.length;

    const primaryCtaLabel = useMemo(() => {
        if (whoCanSend === "only_admin" && !doneSelecting) return "Select admin";
        return "Create group";
    }, [whoCanSend, doneSelecting]);

    function hideSelection() {
        if (selectedGroupContacts.length >= 1) setDoneSelecting((p) => !p);
    }

    async function handleCreate() {
        if (!formData.groupName) {
            setCustErr({ message: "Must provide group name", on: 2 });
            return;
        }
        if (!formData.description) {
            setCustErr({ message: "Please enter some description", on: 3 });
            return;
        }
        if (selectedGroupContacts.length < 2) {
            setCustErr({ message: "Please add at least two members", on: 4 });
            return;
        }

        setCustErr({ message: "", on: 0 });

        try {
            await axios.post<newGroupTypes>(
                `${api}/chat/create-group-chat`,
                {
                    contacts: selectedGroupContacts,
                    groupName: formData.groupName,
                    description: formData.description,
                    whoCanSend,
                    avatar: tempAvatar,
                    public_id: temp_pid,
                },
                { withCredentials: true }
            );

            window.location.reload()
            disp(clearGroupContact());
            disp(openGroupChat({ trigger: false }));
        } catch (error) {
            setCustErr({ message: "Something went wrong. Please try again.", on: 1 });
        }
    }

    function cancel() {
        disp(clearGroupContact());
        disp(openGroupChat({ trigger: false }));
    }

    function clickAvatar() {
        avatarRef.current?.click();
    }

    function selectAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (e.target.files && file) {
            const render = new FileReader();
            render.onload = () => {
                if (typeof render.result === "string") setTempAvatar(render.result);
            };
            render.readAsDataURL(file);
            setShowEditor(true);
        }
    }

    if (!display) return null;

    return (
        <>
            <SampleCropper3
                image={tempAvatar}
                setOpen={setShowEditor}
                setImage={setTempAvatar}
                setPiblicId={setTemp_pid}
                open={showEditor}
            />

            <section
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
                aria-modal="true"
                role="dialog"
            >
                <div className="w-full max-w-[28rem] rounded-2xl glass-panel shadow-2xl overflow-hidden border border-white/15">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={clickAvatar}
                                className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-[var(--c-accent)] shadow-md hover:scale-105 transition"
                                title="Change group avatar"
                            >
                                <img src={tempAvatar || g} alt="Group avatar" className="h-full w-full object-cover" />
                            </button>

                            <div className="flex flex-col">
                                <div className="text-[var(--c-text-primary)] font-bold text-base">Create Group Chat</div>
                                <div className="text-xs text-[var(--c-text-muted)]">
                                    {membersCount >= 2 ? (
                                        <span>
                                            Selected: <span className="font-semibold accent-text">{membersCount} members</span>
                                        </span>
                                    ) : (
                                        <span className="text-amber-400">Pick at least 2 members</span>
                                    )}
                                </div>
                            </div>

                            <input
                                type="file"
                                ref={avatarRef}
                                accept="image/*"
                                onChange={selectAvatar}
                                className="hidden"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={cancel}
                            className="rounded-lg px-3 py-1.5 text-xs text-[var(--c-text-muted)] hover:bg-white/10 transition"
                        >
                            Close
                        </button>
                    </div>

                    <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                        {custErr.on === 1 && (
                            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                                {custErr.message}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label htmlFor="groupName" className="text-xs font-medium text-[var(--c-text-muted)]">
                                    Group Name
                                </label>
                                <input
                                    id="groupName"
                                    name="groupName"
                                    type="text"
                                    value={formData.groupName}
                                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                    placeholder="Enter group name..."
                                    className="mt-1 w-full rounded-xl glass-card px-3 py-2 text-sm text-[var(--c-text-primary)] outline-none focus:border-[var(--c-accent)] transition"
                                />
                                {custErr.on === 2 && (
                                    <p className="mt-1 text-xs text-red-400">{custErr.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="text-xs font-medium text-[var(--c-text-muted)]">
                                    Description
                                </label>
                                <input
                                    id="description"
                                    name="description"
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What is this group about?"
                                    className="mt-1 w-full rounded-xl glass-card px-3 py-2 text-sm text-[var(--c-text-primary)] outline-none focus:border-[var(--c-accent)] transition"
                                />
                                {custErr.on === 3 && (
                                    <p className="mt-1 text-xs text-red-400">{custErr.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="whoCanSend" className="text-xs font-medium text-[var(--c-text-muted)]">
                                    Who can send messages?
                                </label>
                                <select
                                    id="whoCanSend"
                                    className="mt-1 w-full rounded-xl glass-card px-3 py-2 text-sm text-[var(--c-text-primary)] outline-none focus:border-[var(--c-accent)] transition"
                                    value={whoCanSend}
                                    onChange={(e) => setWhoCanSet(e.target.value)}
                                >
                                    <option value="anyone" className="bg-slate-900 text-white">Anyone</option>
                                    <option value="only_admin" className="bg-slate-900 text-white">Only admin</option>
                                    <option value="no_one" className="bg-slate-900 text-white">No one</option>
                                </select>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-[var(--c-text-primary)]">Members</div>

                                <button
                                    type="button"
                                    disabled={membersCount < 1}
                                    onClick={hideSelection}
                                    className="rounded-lg px-3 py-1 text-xs accent-bg text-black font-semibold disabled:opacity-50 transition"
                                >
                                    {doneSelecting ? "Select more" : "Done"}
                                </button>
                            </div>

                            <div className="mt-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                                {selectedGroupContacts.map((val, idx) => (
                                    <div key={idx} className="shrink-0">
                                        <SelectedContacts avatar={val.avatar} admin={val.admin} />
                                    </div>
                                ))}
                            </div>

                            {custErr.on === 4 && (
                                <p className="mt-2 text-xs text-red-400">{custErr.message}</p>
                            )}

                            {!doneSelecting && (
                                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {contacts.map((val, idx) => (
                                        <SelectContactItem
                                            key={idx}
                                            _id={val._id}
                                            avatar={val.avatar}
                                            userId={val.userId}
                                            searchTag={val.searchTag}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {whoCanSend === "only_admin" && doneSelecting && (
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <div className="text-xs font-semibold text-[var(--c-text-primary)]">Select Admin</div>
                                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                    {selectedGroupContacts.map((val, idx) => (
                                        <AdminSelect
                                            key={idx}
                                            _id={val._id}
                                            userId={val.userId}
                                            avatar={val.avatar}
                                            searchTag={val.searchTag}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-5 py-3 border-t border-white/10 bg-white/5">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={whoCanSend === "only_admin" && !doneSelecting ? hideSelection : handleCreate}
                                disabled={whoCanSend === "only_admin" && !doneSelecting ? membersCount < 1 : false}
                                className="flex-1 rounded-xl accent-bg text-black font-bold py-2 text-sm shadow-md hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
                            >
                                {primaryCtaLabel}
                            </button>

                            <button
                                type="button"
                                onClick={cancel}
                                className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium py-2 text-sm transition cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

// Quick Theme Switcher Dropdown Component
const QuickThemeSwitcher = () => {
    const { theme, setThemePreset, themes } = useTheme();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition flex items-center justify-center text-[var(--c-accent)] cursor-pointer"
                title="Change Theme"
            >
                <FaPalette size={16} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl glass-panel shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--c-text-muted)] border-b border-white/10 mb-1">
                        Select Theme
                    </div>
                    <div className="max-h-60 overflow-y-auto px-1 space-y-1">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setThemePreset(t.id as ThemePreset);
                                    setOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                                    theme === t.id ? 'bg-[var(--c-accent)]/20 text-[var(--c-accent)] font-bold' : 'text-[var(--c-text-primary)] hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: t.primaryColor }}></span>
                                    <span>{t.name}</span>
                                </div>
                                {theme === t.id && <FaCheck className="text-[var(--c-accent)]" size={10} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ContactList = () => {
    const disp = useAppDispatch();
    const searchUsers = useAppSelector((state) => state.temp.searchUsers);
    const users = useAppSelector((state) => state.auth.contacts);
    const archUsers = useAppSelector((state) => state.auth.safer);
    const groups = useAppSelector((state) => state.auth.groups);
    const isSearching = useAppSelector((state) => state.triggers.searching);
    const chatType: number = useAppSelector((state) => state.temp.chatListTypes);

    const [searchQuery, setSearchQuery] = useState<string>("");

    async function search(query: string = searchQuery) {
        interface RespTypes {
            data: {
                Users: searchUserTypes[]
            };
        }
        try {
            const resp = await axios.post<RespTypes>(`${api}/contact/search`, {
                searchKeyword: query
            }, { withCredentials: true })

            disp(searching({ users: resp.data.data.Users }))
        } catch (error) { }
    }

    function setChatType(trigger: number) {
        disp(contactListingFunction({ trigger: trigger }))
    }

    const serachTOut = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [searchTrigger, setSearchTrigger] = useState<boolean>(false)

    useEffect(() => {
        if (searchQuery.length <= 3) {
            disp(setSearching({ trigger: false }))
            setSearchTrigger(false)
        } else {
            if (serachTOut.current) clearTimeout(serachTOut.current);

            serachTOut.current = setTimeout(() => {
                setSearchTrigger(true)
            }, 500)

            disp(setSearching({ trigger: true }))
        }

    }, [searchQuery, setSearchQuery])

    useEffect(() => {
        if (searchTrigger) {
            search(searchQuery);
            setSearchTrigger(false)
        }
    }, [searchTrigger, setSearchTrigger])

    return (
        <>
            <CreateGroupChat />
            <section className="w-full h-[100vh] flex items-center justify-center p-2">
                <section className="w-full h-[98%] glass-panel flex flex-col gap-3 items-center p-3 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                    {/* Top Bar Navigation */}
                    <div className="flex justify-between items-center w-full px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold tracking-wider text-[var(--c-text-primary)]">LinkUp</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full accent-bg text-black font-bold">Chats</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <QuickThemeSwitcher />
                            <button 
                                onClick={() => disp(openGroupChat({ trigger: true }))}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition text-[var(--c-text-primary)] cursor-pointer"
                                title="Create Group Chat"
                            >
                                <CiCirclePlus size={18} />
                            </button>
                            <NavLink to={'/user'}>
                                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 transition text-[var(--c-text-primary)] cursor-pointer" title="Settings">
                                    <CiSettings size={18} />
                                </button>
                            </NavLink>
                        </div>
                    </div>

                    {/* Search Input Bar */}
                    <div className="w-full">
                        <div className="w-full h-10 flex items-center gap-2.5 rounded-xl px-3 glass-card border border-white/10 focus-within:border-[var(--c-accent)] transition-all">
                            <CiSearch className="text-[var(--c-text-muted)] text-lg" />
                            <input 
                                type="text" 
                                maxLength={50} 
                                value={searchQuery}
                                onChange={((e) => setSearchQuery(e.target.value))} 
                                placeholder="Search contacts & groups..." 
                                className="w-full outline-none text-xs text-[var(--c-text-primary)] placeholder:text-[var(--c-text-muted)] bg-transparent font-medium" 
                            />
                        </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="w-full">
                        <div className="w-full h-9 flex justify-evenly items-center gap-1 p-1 rounded-xl glass-card border border-white/10">
                            <button 
                                onClick={() => setChatType(1)} 
                                className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    chatType === 1 ? 'accent-bg text-black shadow-md' : 'text-[var(--c-text-muted)] hover:text-white'
                                }`}
                                title="Direct Chats"
                            >
                                <FaUserFriends size={14} />
                                <span>Direct</span>
                            </button>
                            <button 
                                onClick={() => setChatType(2)} 
                                className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    chatType === 2 ? 'accent-bg text-black shadow-md' : 'text-[var(--c-text-muted)] hover:text-white'
                                }`}
                                title="Groups"
                            >
                                <MdGroups size={18} />
                                <span>Groups</span>
                            </button>
                            <button 
                                onClick={() => setChatType(3)} 
                                className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    chatType === 3 ? 'accent-bg text-black shadow-md' : 'text-[var(--c-text-muted)] hover:text-white'
                                }`}
                                title="Archived"
                            >
                                <FaArchive size={14} />
                                <span>Archived</span>
                            </button>
                        </div>
                    </div>

                    {/* Contact / Group List */}
                    <div className="w-full flex-1 rounded-xl glass-card p-1.5 overflow-y-auto border border-white/10">
                        {
                            isSearching ? (
                                (searchUsers.length !== 0) ? (
                                    searchUsers.map((user, idx) => (
                                        <ContactItem key={idx} _id={user._id} avatar={user.avatar} searchTag={user.searchTag} isOnline={user.isOnline} />
                                    ))
                                ) : <NoContacts />
                            ) : (
                                chatType === 1 ?
                                    (!users.length ? <NoContacts /> : (
                                        users.map((user, idx) => (
                                            <ContactItem key={idx} _id={user._id} avatar={user.avatar} searchTag={user.searchTag} lastMessage={user.lastMessage} time={user.time} isOnline={user.isOnline} />
                                        ))
                                    )) :
                                    chatType === 2 ? (!groups.length ? <NoContacts /> : (
                                        groups.map((user, idx) => (
                                            <ContactItem key={idx} _id={user._id} avatar={user.avatar} searchTag={user.groupName} time={user.time} lastMessage={user.lastMessage} isOnline={false} />
                                        ))
                                    )) :
                                        chatType === 3 ? (!archUsers.length ? <NoContacts /> : (
                                            archUsers.map((user, idx) => (
                                                <ContactItem key={idx} _id={user._id} avatar={user.avatar} searchTag={user.searchTag} lastMessage={user.lastMessage} time={user.time} isOnline={user.isOnline} />
                                            ))
                                        )) : <NoContacts />
                            )
                        }
                    </div>
                </section>
            </section>
        </>
    )
}