import { CiCirclePlus, CiSearch, CiSettings } from 'react-icons/ci'
import g from '../../assets/no_dp.png'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useContext, useEffect, useState } from 'react'
import { setSearching } from '../../app/functions/triggers'
import axios from 'axios'
import { appendGroupAdmin, appendGroupContact, clearGroupContact, contactListingFunction, openGroupChat, searching, type groupContactTypes, type searchUserTypes } from '../../app/functions/temp'
import { saveContact, saveGroup, type groupsResp, type newChatTypes } from '../../app/functions/auth'
import { getTimeDifference } from '../../helpers/timeConverter'
import { AppContext } from '../../context/AppContext'
import { FaArchive, FaUserFriends } from 'react-icons/fa'
import { MdGroups } from 'react-icons/md'



const api = import.meta.env.VITE_API

export const ContactItem = ({ _id, searchTag, avatar, lastMessage = "start talking", time = null, isOnline }: {
    _id: string,
    searchTag: string,
    avatar: string,
    lastMessage?: string,
    time?: Date | null,
    isOnline: boolean
}) => {
    const context = useContext(AppContext)

    if (!context) {
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
                disp(saveContact({ newChat: resp.data.data.newContact }));
                disp(setSearching({ trigger: false }));
                talk(resp.data.data.newContact._id);

            } catch (error) {
                console.log(`error saving contact ${error}`);
            }
        } else {
            // disp(selectContact({ id: _id }))
            talk(_id);
        }
    }

    return (
        <div onClick={() => select()} className='w-full bg-transparent h-[4rem] cursor-pointer hover:bg-purple-900'>
            <div className="grid h-full grid-cols-[0.1fr_1.3fr_5.7fr_0.8fr] items-center px-1 ">
                <div className="flex items-center">
                    <div className={`w-2 h-2 bg-green-500 rounded-2xl ${isOnline ? 'inline' : 'hidden'}`} ></div>
                </div>
                <div className="w-full overflow-hidden h-full flex items-center justify-center">
                    <div className='w-[2.5rem] h-[2.5rem] flex items-center justify-center overflow-hidden rounded-[10rem] bg-[#e4e6e7] md:h-[2rem] md:w-[2rem]'>
                        <img src={avatar || g} alt="😒" className="max-h-[2.5rem] h-full md:max-h-[1.5rem]" />
                    </div>
                </div>
                <div className="w-full h-full pl-1 flex gap-0  justify-center flex-col">
                    <p className="text-xl font-mono text-[#E2E8F0] md:text-[15px]">{searchTag}</p>
                    <p className="text-sm font-serif text-gray-300 md:text-[10px]">{lastMessage || null}</p>
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
        setIsSelected(!(Boolean(sel.length)));
    }

    return (
        <div onClick={() => select(_id)} className={` h-[4rem] cursor-pointer ${isSelected ? 'bg-purple-950' : null} hover:bg-purple-900`}>
            <div className="grid h-full grid-cols-[0.1fr_1.3fr_5.7fr_0.8fr] items-center px-1 ">
                <div className="flex items-center">
                    <input type="checkbox" checked={isSelected} className="" onChange={() => select(_id)} />
                </div>
                <div className="w-full overflow-hidden h-full flex items-center justify-center">
                    <div className='w-[2.5rem] h-[2.5rem] flex items-center justify-center overflow-hidden rounded-[10rem] bg-[#e4e6e7] md:h-[2rem] md:w-[2rem]'>
                        <img src={avatar || g} alt="😒" className="max-h-[2.5rem] h-full md:max-h-[1.5rem]" />
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
        <div onClick={() => select(_id)} className={` h-[4rem] cursor-pointer ${isSelected ? 'bg-purple-950' : null} hover:bg-purple-900`}>
            <div className="grid h-full grid-cols-[0.1fr_1.3fr_5.7fr_0.8fr] items-center px-1 ">
                <div className="flex items-center">
                    <input type="checkbox" checked={isSelected} className="" />
                </div>
                <div className="w-full overflow-hidden h-full flex items-center justify-center">
                    <div className='w-[2.5rem] h-[2.5rem] flex items-center justify-center overflow-hidden rounded-[10rem] bg-[#e4e6e7] md:h-[2rem] md:w-[2rem]'>
                        <img src={avatar || g} alt="😒" className="max-h-[2.5rem] h-full md:max-h-[1.5rem]" />
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


interface newGroupTypes {
    data: {
        newGroupDetails: groupsResp
    }
}

const CreateGroupChat = () => {
    const disp = useAppDispatch();
    const display = useAppSelector((state) => state.temp.activeGroup)
    const contacts = useAppSelector((state) => state.auth.contacts);
    const selectedGroupContacts = useAppSelector((state) => state.temp.groupContact);
    const [doneSelecting, setDoneSelecting] = useState<boolean>(false);
    const [whoCanSend, setWhoCanSet] = useState<string>('anyone');
    const [custErr, setCustErr] = useState<{
        message: string;
        on: number;
    }>({
        message: '',
        on: 0
    })
    const [formData, setFormData] = useState<{
        groupName: string;
        description: string;
    }>({
        groupName: '',
        description: ''
    });

    function hideSelection() {
        if (selectedGroupContacts.length >= 1) {
            setDoneSelecting(!doneSelecting)
        }
    }

    async function handleCreate() {
        if (!formData.groupName) {
            setCustErr({
                message: 'must provide group name',
                on: 2
            })
            return;
        }
        else if (!formData.description) {
            setCustErr({
                message: 'please enter some description',
                on: 3
            })
            return;
        }
        else if (selectedGroupContacts.length < 2) {
            setCustErr({
                message: 'please add at least two members',
                on: 4
            })
            return;
        }

        setCustErr({
            message: '',
            on: 0
        })
        try {
            const resp = await axios.post<newGroupTypes>(`${api}/chat/create-group-chat`, {
                contacts: selectedGroupContacts,
                groupName: formData.groupName,
                description: formData.description,
                whoCanSend: whoCanSend
            }, {
                withCredentials: true
            });


            console.log(`resp new group: ${JSON.stringify(resp, null, 2)}`);


            disp(saveGroup({ newChat: resp.data.data.newGroupDetails }))
            disp(clearGroupContact())
            disp(openGroupChat({ trigger: false }))
        } catch (error) {
            console.log(`error while creating contact: ${error}`);
        }
    }

    function cancel(){
        disp(clearGroupContact())
            disp(openGroupChat({ trigger: false }))
    }

    return (
        <section className={`absolute ${display ? 'flex' : 'hidden'} flex-col justify-center items-center min-h-full w-[90%] bg-[#284f4e80] md:w-[100%] pb-[3rem]`}>
            <div className=" flex flex-col items-center gap-2 min-h-[98%] w-full bg-[#337775] pt-3 md:w-[80%]">
                <div className="w-full flex justify-center items-center">
                    <h3 className="uppercase text-2xl text-black font-bold underline-offset-1 underline select-none">Create Group Chat</h3>
                </div>
                <div className="w-full h-[6rem] flex justify-center items-center">
                    <div className="h-[4rem] w-[4rem] rounded-[50%] overflow-hidden cursor-pointer border-2 border-b-black">
                        <img src={g} alt="😁" className="w-full h-full" />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4 w-[90%]">
                    <div className="flex flex-col min-h-[4rem] gap-1 w-[90%]">
                        <label htmlFor="groupName">Group Name</label>
                        <input type="text" name='groupName' id='groupName' onChange={(e) => setFormData({ ...formData, groupName: e.target.value })} className="w-full h-[2rem] text-white bg-slate-700 pl-1 rounded-sm" placeholder='Enter Group Name' />
                        {
                            <p className={`text-red-500 bg-amber-200 ${custErr.on === 2 ? 'block' : 'hidden'}`}>{custErr.message}</p>
                        }
                    </div>
                    <div className="flex flex-col min-h-[4rem] gap-1 w-[90%]">
                        <label htmlFor="description">Description</label>
                        <input type="text" name='description' id='description' className="w-full h-[2rem] text-white bg-slate-700 pl-1 rounded-sm"
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={`Hii let's talk`} />
                        {
                            <p className={`text-red-500 bg-amber-200 ${custErr.on === 3 ? 'block' : 'hidden'}`}>{custErr.message}</p>
                        }
                    </div>
                    <div className="flex flex-col min-h-[4rem] gap-1 w-[90%]">
                        <label htmlFor="description">who can send message?</label>
                        <select name='description' id='description' className="w-full h-[2rem] text-white bg-slate-700 pl-1 rounded-sm uppercase" onChange={(e) => setWhoCanSet(e.target.value)} >
                            <option value="anyone">anyone</option>
                            <option value="only_admin">only admin</option>
                            <option value="no_one">on one</option>
                        </select>
                    </div>
                </div>
                <div className="w-[90%] border-t-2 border-amber-500">
                    <div className="flex  justify-between pt-1">
                        <div className="text-lg font-mono">select at least 2</div>
                        <button disabled={selectedGroupContacts.length < 1} onClick={hideSelection} className="px-1 bg-purple-500 disabled:bg-purple-300 disabled:text-gray-200 rounded-sm cursor-pointer">{doneSelecting ? 'select more' : 'done'}</button>
                    </div>
                    {
                        <p className={`text-red-500 bg-amber-200 ${custErr.on === 4 ? 'block' : 'hidden'}`}>{custErr.message}</p>
                    }
                    <div className={`${doneSelecting ? 'hidden' : 'block'} pt-2`}>
                        {
                            contacts.map((val, idx) => (
                                <SelectContactItem key={idx} _id={val._id} avatar={val.avatar} userId={val.userId} searchTag={val.searchTag} />
                            ))
                        }
                    </div>
                </div>
                <div className={`w-[90%] border-t-2 border-amber-500 ${whoCanSend === 'only_admin' && doneSelecting ? 'block' : 'hidden'}`}>
                    <div className="flex  justify-between pt-1">
                        <div className={`text-lg font-mono `}>select group admins</div>
                    </div>
                    <div className={`pt-2`}>
                        {
                            selectedGroupContacts.map((val, idx) => (
                                <AdminSelect key={idx} _id={val._id} userId={val.userId} avatar={val.avatar} searchTag={val.searchTag} />
                            ))
                        }
                    </div>
                </div>

                <div className="fixed bottom-[1.5vh] w-[90%] gap-1 flex items-center justify-center">
                    {
                        (whoCanSend === 'only_admin' && !doneSelecting) ? (
                            <button disabled={selectedGroupContacts.length < 1} className="w-[40%] h-8 text-lg bg-blue-950 text-white cursor-pointer rounded-sm" onClick={hideSelection}>select admin</button>
                        ) : (
                            <button className="w-[40%] h-8 text-lg bg-blue-950 text-white cursor-pointer rounded-sm" onClick={handleCreate}>Create</button>
                        )
                    }
                    <button className="w-[40%] h-8 text-lg bg-blue-950 text-white cursor-pointer rounded-sm" onClick={cancel}>Cancel</button>
                </div>
            </div>
        </section>
    )
}

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

            // console.log(`search resp is: ${JSON.stringify(resp, null, 2)}`);

            disp(searching({ users: resp.data.data.Users }))
        } catch (error) {
            console.log(`error in searching: ${error}`);
        }
    }

    function setChatType(trigger: number) {
        disp(contactListingFunction({ trigger: trigger }))
    }

    useEffect(() => {
        if (searchQuery.length <= 3) {
            disp(setSearching({ trigger: false }))
        } else {
            disp(setSearching({ trigger: true }))
            search(searchQuery)
        }
    }, [searchQuery, setSearchQuery])

    return (
        <>
            <CreateGroupChat />
            <section className="w-full h-[100vh] flex items-center justify-center">
                <section className="w-[90%] h-[98%]  bg-slate-800 flex flex-col gap-[1rem] items-center pt-2  rounded-lg">
                    {/* top searchbox */}
                    <div className="flex justify-between w-[95%]">
                        <div className="flex justify-center gap-2 items-center">
                            <div className="text-lg select-none">inbox</div>
                            <div className="bg-green-500 text-[12px] w-[3rem] h-[1.2rem] text-center rounded-sm cursor-pointer select-none">2 new</div>
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