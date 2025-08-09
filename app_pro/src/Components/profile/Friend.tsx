import { BiBlock, BiExit, BiUserCircle } from "react-icons/bi"
import { FaAngleLeft } from "react-icons/fa"
// import { FcSettings } from "react-icons/fc"
import { HiLocationMarker } from "react-icons/hi"
import { RiArchive2Line } from "react-icons/ri"
import { NavLink, useNavigate } from "react-router-dom"
import x from '../../assets/no_dp.png'
import axios from 'axios'
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { addArchieved, blockTrigger, removeArchieved, type contactTypes } from "../../app/functions/auth"
import { blockSelected, clearTemp, contactListingFunction, setAddGroupModal, setTempUser } from "../../app/functions/temp"
import { GrDown, GrUp } from "react-icons/gr"
import { useEffect, useState } from "react"
import { ContactItem } from "../subComponents/Contact"

const env = import.meta.env.VITE_API


const SelectContactItem = ({ _id, searchTag, avatar, userId }: {
    _id: string,
    searchTag: string,
    avatar: string,
    userId: string
}) => {
    const disp = useAppDispatch()
    const tempUsers = useAppSelector((state) => state.temp.tempUser)

    const [isSelected, setIsSelected] = useState<boolean>(false)

    async function select() {
        disp(setTempUser({
            contacts: {
                avatar: avatar,
                searchTag: searchTag,
                userId: userId
            }
        }))

        let isSel = tempUsers.filter((val) => val._id === userId)

        console.log(`cheking the goal ${JSON.stringify(_id, null, 2)}`);

        setIsSelected(!(Boolean(isSel.length)));
    }

    return (
        <div onClick={() => select()} className={`px-2 w-full h-[4rem] cursor-pointer ${isSelected ? 'bg-purple-950' : null} hover:bg-purple-900`}>
            <div className="grid h-full grid-cols-[0.1fr_1.3fr_5.7fr_0.8fr] items-center px-1 ">
                <div className="flex items-center">
                    {/* <input type="checkbox" checked={isSelected} className="" onChange={() => select()} /> */}
                </div>
                <div className="w-full overflow-hidden h-full flex items-center justify-center">
                    <div className='w-[2.5rem] h-[2.5rem] flex items-center justify-center overflow-hidden rounded-[10rem] bg-[#e4e6e7] md:h-[2rem] md:w-[2rem]'>
                        <img src={avatar || x} alt="😒" className="max-h-[2.5rem] h-full md:max-h-[1.5rem]" />
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
    }, [])

    return (
        <section className={`absolute w-full h-full bg-[#2342708a] ${open ? 'flex' : 'hidden'} justify-center items-center flex-col`}>
            <div className="min-h-[90%] w-[90%] flex flex-col items-center bg-slate-800 rounded-md overflow-hidden">
                <div className="w-full flex justify-between h-12 items-center px-2 bg-slate-900">
                    <div className="">Members</div>
                    <div className="flex gap-1">
                        <button className="w-[5rem] text-sm h-[1.6rem] cursor-pointer bg-pink-500 hover:bg-red-500 rounded-md" disabled={tempUsers.length < 1} onClick={() => addNewMember()}>Add</button>
                    </div>
                </div>
                <div className=" w-full flex flex-col items-center justify-center">
                    {
                        filteredUsers.map((user, index) => (
                            <SelectContactItem userId={user.userId} key={index} _id={user._id} avatar={user.avatar} searchTag={user.searchTag} />
                        ))
                    }
                </div>
            </div>
        </section>
    )
}

const Friend = () => {
    const router = useNavigate()
    const disp = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user)
    const contact = useAppSelector((state) => state.temp.selectedContact)
    const chatType = useAppSelector((state) => state.temp.chatListTypes)

    const [showMembers, setShowMembers] = useState<boolean>(false)

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



    return (
        <>
            <AddMemberModel />
            <section className="w-full h-[100vh] overflow-y-auto flex justify-center rounded-sm">
                <section className="w-[90%] h-[98%] flex flex-col gap-2 md:w-[98%]">
                    <div className="w-full grid grid-cols-[0.3fr_9.7fr] pt-3 mt-1  bg-slate-800 rounded-[9px_9px_0_0]">
                        <div className="pt-2 pl-1"><NavLink to={'/'} ><FaAngleLeft size={20} /></NavLink></div>
                        <div className="w-full flex flex-col justify-center items-center gap-3">
                            <div className="w-full h-auto flex flex-col gap-1 justify-center items-center">
                                <div className="bg-inherit w-[10rem] h-[10rem] rounded-[50%] overflow-hidden sha">
                                    <img src={contact?.avatar || x} alt="profile picture" className="w-full h-auto" />
                                </div>
                                <div className="w-full flex flex-col gap-0.5 items-center justify-center">
                                    <p className="text-[22px] font-bold">{contact?.userName}</p>
                                    <div className="flex items-center justify-center gap-1 text-sm"><HiLocationMarker color="#c8bfbf" />NY, New Yourk City</div>
                                </div>
                            </div>
                            <div className="w-full grid items-center justify-center grid-cols-[1fr_1fr]">
                                <div className="w-full h-[5rem] flex justify-center flex-col  text-center border-t-2 border-r-2 border-gray-400">
                                    <p className="text-[12px] md:text-[20px] font-bold">{contact?.members?.length || contact?.email}</p>
                                    <p className="text-[12px] md:text-[17px] ">{contact?.isGroup ? 'Members' : 'Email'}</p>
                                </div>
                                <div className="w-full h-[5rem] flex justify-center flex-col  text-center border-t-2 border-l-2 border-gray-400">
                                    <p className="text-[12px] md:text-[20px] font-bold">{contact?.email || user.email}</p>
                                    <p className="text-[12px] md:text-[17px]  ">{contact?.searchTag || user.searchTag}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {
                        contact?.isGroup &&
                        <div className="w-full flex flex-col items-center justify-center gap-1">
                            <div className="w-[100%]  px-[5%]">
                                <div onClick={() => setShowMembers(!showMembers)} className="w-full h-[3rem] flex justify-between items-center cursor-pointer px-2 hover:bg-slate-800">
                                    <div className="text-xl">Members</div>
                                    <div className="">{!showMembers ? <GrDown /> : <GrUp />}</div>
                                </div>
                                {/*  */}
                                <div className={`${showMembers ? 'block' : 'hidden'} cursor-pointer w-[100%] px-[5%]`}>
                                    <div className="text-gray-300 flex items-center justify-between flex-col"></div>
                                    {
                                        contact.members?.map((member, index) => (
                                            <ContactItem _id={member._id} avatar={member.avatar} searchTag={member.searchTag} key={index} isOnline={member.isOnline} />
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    }

                    <div className="w-full flex flex-col items-center justify-center gap-1 ">
                        {
                            chatType === 3 ?
                                (
                                    <div onClick={() => unArchiev()} className={`cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-1 items-center justify-center hover:bg-[#4a697894]`}>
                                        <div className="text-gray-300 flex items-center justify-between"><RiArchive2Line size={20} /></div>
                                        <div className="w-full ">
                                            <div className="text-[18px] font-mono">Un Archive</div>
                                            <div className="text-[15px]">Take Chat Out Of Archived</div>
                                        </div>
                                    </div>
                                ) :
                                (
                                    <div onClick={() => archiev()} className={`cursor-pointer w-[100%] h-[4rem] px-[5%] ${chatType === 2 ? 'hidden' : 'grid'} grid-cols-[1fr_8fr_1fr] gap-1 items-center justify-center hover:bg-[#4a697894]`}>
                                        <div className="text-gray-300 flex items-center justify-between"><RiArchive2Line size={20} /></div>
                                        <div className="w-full ">
                                            <div className="text-[18px] font-mono">Archive</div>
                                            <div className="text-[15px]">Achive Chat</div>
                                        </div>
                                    </div>
                                )
                        }

                        {
                            contact?.isGroup &&
                            <div onClick={() => disp(setAddGroupModal({ trigger: true }))} className="cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-2 items-center justify-center hover:bg-[#4a697894]">
                                <div className="text-gray-300 flex items-center justify-between"><BiUserCircle size={20} /></div>
                                <div className="w-full ">
                                    <div className="text-[18px] font-mono">Add Member</div>
                                    <div className="text-[15px]">add new member</div>
                                </div>
                            </div>
                        }


                        {
                            !contact?.email ? (
                                <div onClick={() => block_left()} className=" cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-2 items-center justify-center hover:bg-[#4a697894]">
                                    <div className="text-gray-300 flex items-center justify-between"><BiExit size={20} /></div>
                                    <div className="w-full ">
                                        <div className="text-[18px] font-mono">Leave Group</div>
                                        <div className="text-[15px]">Leave this group</div>
                                    </div>
                                </div>
                            ) : (

                                contact.isBlocked ? (
                                    <div onClick={() => ub_block()} className="cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-2 items-center justify-center hover:bg-[#4a697894]">
                                        <div className="text-gray-300 flex items-center justify-between"><BiBlock size={20} /></div>
                                        <div className="w-full ">
                                            <div className="text-[18px] font-mono">Unblock</div>
                                            <div className="text-[15px]">Unblock this user</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => block_left()} className="cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-2 items-center justify-center hover:bg-[#4a697894]">
                                        <div className="text-gray-300 flex items-center justify-between"><BiBlock size={20} /></div>
                                        <div className="w-full ">
                                            <div className="text-[18px] font-mono">Block</div>
                                            <div className="text-[15px]">Block this user</div>
                                        </div>
                                    </div>
                                )
                            )
                        }


                    </div>
                </section>
                {/* </section> */}
            </section>
        </>
    )
}

export default Friend