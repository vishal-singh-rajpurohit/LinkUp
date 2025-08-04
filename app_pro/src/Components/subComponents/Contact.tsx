import { CiSearch, CiSettings } from 'react-icons/ci'
import g from '../../assets/no_dp.png'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useEffect, useState } from 'react'
import { setSearching } from '../../app/functions/triggers'
import axios from 'axios'
import { searching, type searchUserTypes } from '../../app/functions/temp'


const api = import.meta.env.VITE_API

export const ContactItem = ({ _id, searchTag, avatar, lastMessage = "start talking", time = null, isOnline }: {
    _id: string,
    searchTag: string,
    avatar: string,
    lastMessage?: string,
    time?: string | null,
    isOnline: boolean
}) => {
    const disp = useAppDispatch()
    const isSearching = useAppSelector((state) => state.triggers.searching)


    async function select() {
        if (isSearching) {
            try {
                const resp = await axios.post(`${api}/chat/save-contact`,
                    { reciverId: _id },
                    { withCredentials: true }
                )
                disp(setSearching({ trigger: false }))


                console.log(`slect result is: ${JSON.stringify(resp, null, 2)}`);
                

            } catch (error) {
                console.log(`error saving contact ${error}`);
            }
        }
    }
    return (
        <div onClick={() => select()} className='bg-transparent h-[4rem] cursor-pointer hover:bg-purple-900'>
            <div className="grid h-full grid-cols-[0.1fr_1.5fr_6fr_0.3fr] items-center px-3 ">
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
                    <span className="">{time || null}</span>
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

export const ContactList = () => {
    const disp = useAppDispatch();
    const searchUsers = useAppSelector((state) => state.temp.searchUsers)
    const users = useAppSelector((state) => state.auth.contacts);
    const isSearching = useAppSelector((state) => state.triggers.searching)

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

    useEffect(() => {
        if (searchQuery.length <= 3) {
            disp(setSearching({ trigger: false }))
        } else {
            disp(setSearching({ trigger: true }))
            search(searchQuery)
        }
    }, [searchQuery, setSearchQuery])

    return (
        <section className="w-full h-[100vh] flex items-center justify-center">
            <section className="w-[90%] h-[98%]  bg-slate-800 flex flex-col gap-[1rem] items-center pt-2  rounded-lg">
                {/* top searchbox */}
                <div className="flex justify-between w-[95%]">
                    <div className="flex justify-center gap-2 items-center">
                        <div className="text-lg select-none">inbox</div>
                        <div className="bg-green-500 text-[12px] w-[3rem] h-[1.2rem] text-center rounded-sm cursor-pointer select-none">2 new</div>
                    </div>
                    <div className="">
                        <NavLink to={'/user'}><CiSettings className="" size={25} cursor={"pointer"} /></NavLink></div>
                </div>
                {/* search */}
                <div className="w-[95%] flex justify-center items-center">
                    <div className="w-full h-8   flex items-center gap-2 rounded-4xl pl-2  bg-[#ebebeb0d]">
                        <CiSearch />
                        <input type="text" maxLength={50} onChange={((e) => setSearchQuery(e.target.value))} placeholder="search chat" className="w-full outline-0 text-sm text-gray-300 font-serif " />
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
                            (!users.length ? <NoContacts /> : (
                                users.map((user, idx) => (
                                    <ContactItem key={idx} _id={user._id} avatar={user.avatar} searchTag={user.searchTag} lastMessage={user.lastMessage} time={user.time} isOnline={user.isOnline} />
                                ))
                            ))
                        )
                    }
                    {/* <ContactItem /> */}
                </div>
            </section>
        </section>
    )
}

