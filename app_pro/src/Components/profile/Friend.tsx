import { BiAddToQueue, BiBlock, BiExit, BiShow, BiUserCircle } from "react-icons/bi"
import { FaAngleLeft, FaAngleRight } from "react-icons/fa"
// import { FcSettings } from "react-icons/fc"
import { HiLocationMarker } from "react-icons/hi"
import { RiArchive2Line } from "react-icons/ri"
import { NavLink, useNavigate } from "react-router-dom"
import x from '../../assets/no_dp.png'
import axios from 'axios'
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { addArchieved, blockTrigger, removeArchieved, type contactTypes } from "../../app/functions/auth"
import { blockSelected, contactListingFunction } from "../../app/functions/temp"
import { FcDown } from "react-icons/fc"
import { CgMore } from "react-icons/cg"
import { GrDown, GrUp } from "react-icons/gr"
import { useEffect, useState } from "react"
import { ContactItem } from "../subComponents/Contact"

const env = import.meta.env.VITE_API


const AddMemberModel = () => {
    const selectedContact = useAppSelector((state) => state.temp.selectedContact);
    const contacts = useAppSelector((state) => state.auth.contacts)
    const [filteredUsers, setFilteredUser] = useState<contactTypes[]>([])


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


    useEffect(() => {
        console.log(`filtered user: ${JSON.stringify(filteredUsers, null, 2)}`);
    }, [filteredUsers, setFilteredUser])


    return (
        <section className="">
            <div className="">
                <div className="">Members</div>
                <div className="">
                    <button className="">Select All</button>
                    <button className="">Clear</button>
                </div>
            </div>
            <div className="">

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

    async function addNewMember(_id: string) {
        try {
            const resp = await axios.post(`${env}/contact/add-to-group`, {
                contactId: _id
            }, {
                withCredentials: true
            })
        } catch (error) {
            console.log(`error in adding error ${error}`);
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
                            <div className="cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-2 items-center justify-center hover:bg-[#4a697894]">
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