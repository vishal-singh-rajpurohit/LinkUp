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
import { FaArchive, FaUserFriends } from 'react-icons/fa'
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
    const [timer, setTimer] = useState<string>("")

    useEffect(() => {
        if (time) {
            const currTime: string = getTimeDifference(time)
            setTimer(currTime)
        }
    }, [contacts, isSearching])

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
            // disp(selectContact({ id: _id }))
            talk(_id);
        }
    }

    return (
        <div onClick={() => select()} className='w-full bg-transparent h-[4rem] cursor-pointer hover:bg-slate-700'>
            <div className="grid h-full grid-cols-[0.1fr_1.3fr_5.7fr_0.8fr] items-center px-1 ">
                <div className="flex items-center">
                    <div className={`w-2 h-2 bg-green-500 rounded-2xl ${isOnline ? 'inline' : 'hidden'}`} ></div>
                </div>
                <div className="w-full overflow-hidden h-full flex items-center justify-center">
                    <div className='w-[2.5rem] h-[2.5rem] flex items-center justify-center overflow-hidden rounded-[10rem] bg-[#e4e6e7] md:h-[2rem] md:w-[2rem]'>
                        <img src={avatar || g} alt="" className="max-h-[2.5rem] h-full " />
                    </div>
                </div>
                <div className="w-full h-full pl-1 flex gap-0  justify-center flex-col min-w-0">
                    <p className="text-[15px] font-mono text-[#E2E8F0] md:text-[15px]">{searchTag}</p>
                    <p className="text-sm font-serif text-gray-300 md:text-[10px] truncate w-full">{lastMessage || null}</p>
                </div>
                <div className="">
                    <span className="text-[10px]">{timer || ""}</span>
                </div>
            </div>
        </div>
    )
}

export const NoContacts = () => {
    return (
        <div className="w-full bg-transparent h-[4rem] cursor-pointer flex justify-center pt-2">
            <p className="text-2xl">No Contacts</p>
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

        const sel: groupContactTypes[] = groupContact.filter((val) => val._id == id)
        setIsSelected(!sel.length);
    }

    return (
        <div onClick={() => select(_id)} className={` h-[4rem] cursor-pointer  hover:bg-purple-900`}>
            <div className="grid h-full grid-cols-[1.3fr_5.7fr_0.8fr] items-center px-1 ">
                <div className="w-full overflow-hidden h-full flex items-center justify-center relative">
                    <div className='w-[2.5rem] h-[2.5rem] flex items-center justify-center overflow-hidden rounded-[10rem] bg-[#e4e6e7] md:h-[2rem] md:w-[2rem]'>
                        <img src={avatar || g} alt="" className="max-h-[2.5rem] h-full md:max-h-[1.5rem]" />
                    </div>
                    <div className={`absolute pt-[30%] pl-[40%] ${isSelected ? 'flex' : 'hidden'}`}>
                        <CheckCircle color='#45ff60' />
                    </div>
                </div>
                <div className="w-full h-full pl-1 flex gap-0  justify-center flex-col">
                    <p className="text-xl font-mono text-[#E2E8F0] md:text-[15px]">{searchTag}</p>
                </div>
                <div className="">
                    <div className=""></div>
                </div>
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
        <div onClick={() => select(_id)} className={` h-[4rem] cursor-pointer`}>
            <div className="grid h-full grid-cols-[1.3fr_5.7fr_0.8fr] items-center px-1 ">
                <div className="w-full overflow-hidden h-full flex items-center justify-center relative">
                    <div className='w-[2.5rem] h-[2.5rem] flex items-center justify-center overflow-hidden rounded-[10rem] bg-[#e4e6e7] md:h-[2rem] md:w-[2rem]'>
                        <img src={avatar || g} alt="" className="max-h-[2.5rem] h-full md:max-h-[1.5rem]" />
                    </div>
                    <div className={`absolute pt-[30%] pl-[40%] ${isSelected ? 'flex' : 'hidden'}`}>
                        <CheckCircle color='#45ff60' />
                    </div>
                </div>
                <div className="w-full h-full pl-1 flex gap-0  justify-center flex-col">
                    <p className="text-xl font-mono text-[#E2E8F0] md:text-[15px]">{searchTag}</p>
                </div>
                <div className="">
                    <div className=""></div>
                </div>
            </div>
        </div>
    )
}

const SelectedContacts = ({ avatar, admin }: {
    avatar: string;
    admin?: boolean;
}) => {

    return (
        <section className="cursor-pointer">
            <div className={`w-[2.5rem] h-[2.5rem] rounded-[50%] overflow-hidden ${admin ? 'border-2 border-green-400' : ''}`}>
                <img src={avatar || g} alt="" className="w-full h-full" />
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
            // optional: surface a generic message
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

            {/* Overlay */}
            <section
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3"
                aria-modal="true"
                role="dialog"
            >
                {/* Card */}
                <div className="w-full max-w-[28rem] rounded-2xl bg-slate-800 shadow-2xl border border-white/10 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={clickAvatar}
                                className="relative h-12 w-12 rounded-full overflow-hidden border border-white/15 hover:border-emerald-300 transition"
                                title="Change group avatar"
                            >
                                <img src={tempAvatar || g} alt="Group avatar" className="h-full w-full object-cover" />
                            </button>

                            <div className="flex flex-col">
                                <div className="text-white font-semibold leading-5">Create group</div>
                                <div className="text-xs text-slate-300">
                                    {membersCount >= 2 ? (
                                        <span>
                                            Members: <span className="font-semibold text-white">{membersCount}</span>
                                        </span>
                                    ) : (
                                        <span className="text-amber-200">Pick at least 2 members</span>
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
                            className="rounded-lg px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10 transition"
                        >
                            Close
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-4 py-4 space-y-4 max-h-[72vh] overflow-y-auto">
                        {/* Global error */}
                        {custErr.on === 1 && (
                            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                                {custErr.message}
                            </div>
                        )}

                        {/* Group details */}
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="groupName" className="text-xs text-slate-300">
                                    Group name
                                </label>
                                <input
                                    id="groupName"
                                    name="groupName"
                                    type="text"
                                    value={formData.groupName}
                                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                                    placeholder="Enter group name"
                                    className="mt-1 w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-300/60"
                                />
                                {custErr.on === 2 && (
                                    <p className="mt-1 text-xs text-red-300">{custErr.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="description" className="text-xs text-slate-300">
                                    Description
                                </label>
                                <input
                                    id="description"
                                    name="description"
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Hi, let's talk…"
                                    className="mt-1 w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-300/60"
                                />
                                {custErr.on === 3 && (
                                    <p className="mt-1 text-xs text-red-300">{custErr.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="whoCanSend" className="text-xs text-slate-300">
                                    Who can send messages?
                                </label>
                                <select
                                    id="whoCanSend"
                                    className="mt-1 w-full rounded-xl bg-slate-900/50 border border-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-emerald-300/60"
                                    value={whoCanSend}
                                    onChange={(e) => setWhoCanSet(e.target.value)}
                                >
                                    <option value="anyone">Anyone</option>
                                    <option value="only_admin">Only admin</option>
                                    <option value="no_one">No one</option>
                                </select>
                            </div>
                        </div>

                        {/* Members */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                            <div className="flex items-center justify-between">
                                <div className="text-white font-medium">Members</div>

                                <button
                                    type="button"
                                    disabled={membersCount < 1}
                                    onClick={hideSelection}
                                    className="rounded-lg px-3 py-1.5 text-sm bg-purple-600 text-white disabled:bg-purple-600/40 disabled:text-white/60 transition"
                                >
                                    {doneSelecting ? "Select more" : "Done"}
                                </button>
                            </div>

                            {/* Selected list */}
                            <div className="mt-2 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                                {selectedGroupContacts.map((val, idx) => (
                                    <div key={idx} className="shrink-0">
                                        {/* Keep your existing component */}
                                        <SelectedContacts avatar={val.avatar} admin={val.admin} />
                                    </div>
                                ))}
                            </div>

                            {custErr.on === 4 && (
                                <p className="mt-2 text-xs text-red-300">{custErr.message}</p>
                            )}

                            {/* Available contacts */}
                            {!doneSelecting && (
                                <div className="mt-3 space-y-2">
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

                        {/* Admin selection (only when only_admin AND member selection done) */}
                        {whoCanSend === "only_admin" && doneSelecting && (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                <div className="text-white font-medium">Select group admin</div>
                                <div className="mt-3 space-y-2">
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

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-white/10 bg-slate-900/30">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={whoCanSend === "only_admin" && !doneSelecting ? hideSelection : handleCreate}
                                disabled={whoCanSend === "only_admin" && !doneSelecting ? membersCount < 1 : false}
                                className="flex-1 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-semibold py-2 transition disabled:opacity-60"
                            >
                                {primaryCtaLabel}
                            </button>

                            <button
                                type="button"
                                onClick={cancel}
                                className="flex-1 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold py-2 transition"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="mt-2 text-[11px] text-slate-300">
                            Tip: add an avatar to make the group easier to recognize.
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export const ContactList = () => {
    const disp = useAppDispatch();
    const searchUsers = useAppSelector((state) => state.temp.searchUsers);
    const users = useAppSelector((state) => state.auth.contacts);
    const archUsers = useAppSelector((state) => state.auth.safer)
    const groups = useAppSelector((state) => state.auth.groups);
    const isSearching = useAppSelector((state) => state.triggers.searching);
    const chatType: number = useAppSelector((state) => state.temp.chatListTypes)

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
            <section className="w-full h-[100vh] flex items-center justify-center">
                <section className="w-[90%] h-[98%]  bg-slate-800 flex flex-col gap-[1rem] items-center pt-2  rounded-lg">
                    {/* top searchbox */}
                    <div className="flex justify-between w-[95%]">
                        <div className="flex justify-center gap-2 items-center">
                            <div className="text-sm select-none uppercase">inbox</div>
                            {/* <div className="bg-green-500 text-[12px] w-[3rem] h-[1.2rem] text-center rounded-sm cursor-pointer select-none">2 new</div> */}
                        </div>
                        <div className="flex gap-1">
                            <CiCirclePlus title='create group chat' onClick={() => disp(openGroupChat({ trigger: true }))} className="" size={25} cursor={"pointer"} />
                            <NavLink to={'/user'}><CiSettings title='profile and settings' className="" size={25} cursor={"pointer"} /></NavLink>
                        </div>
                    </div>
                    {/* search */}
                    <div className="w-[95%] flex justify-center items-center">
                        <div className="w-full h-8   flex items-center gap-2 rounded-4xl pl-2  bg-[#ebebeb0d]">
                            <CiSearch />
                            <input type="text" maxLength={50} onChange={((e) => setSearchQuery(e.target.value))} placeholder="search chat" className="w-full outline-0 text-sm text-gray-300 font-serif " />
                        </div>
                    </div>
                    {/* Filter */}
                    <div className="w-[95%] flex justify-center items-center">
                        <div className="w-full h-8 flex justify-evenly items-center gap-2 rounded-4xl pl-2  bg-[#ebebeb0d]">
                            <div className="cursor-pointer"><FaUserFriends size={20} className={`${chatType === 1 ? 'text-green-300' : ''}`} onClick={() => setChatType(1)} /> </div>
                            <div className="cursor-pointer"><MdGroups size={30} className={`${chatType === 2 ? 'text-green-300' : ''}`} onClick={() => setChatType(2)} /> </div>
                            <div className="cursor-pointer"><FaArchive size={20} className={`${chatType === 3 ? 'text-green-300' : ''}`} onClick={() => setChatType(3)} /> </div>
                        </div>
                    </div>
                    {/* LIst */}
                    <div className="w-[95%] h-full rounded-lg bg-[#ebebeb0d] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
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
                        {/* <ContactItem /> */}
                    </div>
                </section>
            </section>
        </>
    )
}