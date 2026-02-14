import React, { useState, type SetStateAction } from "react"
import { TfiHelpAlt } from "react-icons/tfi"
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import x from "../../../assets/no_dp.png"
import { clearTemp, setTempUser } from "../../../app/functions/temp";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const api = import.meta.env.VITE_API;

interface reportType {
    name: string;
    message: string;
}

const SuccessModal = ({ open }: { open: boolean; }) => {
    return (
        <section className={`w-full h-full absolute z-10 top-0 ${open ? 'flex' : 'hidden'} justify-center items-center bg-[#342f41b8]`}>
            <div className="w-[80%] h-[30%] flex flex-col justify-center items-center gap-2 bg-sky-800 rounded-md">
                <p className="text-xl items-center text-center">Thanks for your feedback, we will fix it soon</p>
                <button className="w-[4rem] h-[1.5rem] cursor-pointer bg-amber-600 rounded-sm" onClick={() => window.location.pathname = "/"}>OK</button>
            </div>
        </section>
    )
}

const SelectContactItem = ({ _id, searchTag, avatar, userId }: {
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
                _id: _id || userId,
                avatar: avatar,
                searchTag: searchTag,
                userId: userId
            }
        }))

        let isSel = tempUsers.filter((val) => val._id === userId)

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

const AddContactModel = ({ open, setOpen }: {
    open: boolean;
    setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
    const tempUsers = useAppSelector((state) => state.temp.tempUser)
    const contacts = useAppSelector((state) => state.auth.contacts)

    function submit() {
        setOpen(false)
    }

    return (
        <section className={`absolute w-full h-full bg-[#2342708a] ${open ? 'flex' : 'hidden'} justify-center items-center flex-col`}>
            <div className="min-h-[90%] w-[90%] flex flex-col items-center bg-slate-800 rounded-md overflow-hidden">
                <div className="w-full flex justify-between h-12 items-center px-2 bg-slate-900">
                    <div className="">Report</div>
                    <div className="flex gap-1">
                        <button className="w-[5rem] text-sm h-[1.6rem] cursor-pointer bg-pink-500 hover:bg-red-500 rounded-md" onClick={() => setOpen(false)}>CLose</button>
                        <button className="w-[5rem] text-sm h-[1.6rem] cursor-pointer bg-pink-500 hover:bg-red-500 rounded-md" disabled={tempUsers.length < 1} onClick={() => submit()}>done</button>
                    </div>
                </div>
                <div className=" w-full flex flex-col items-center justify-center">
                    {
                        contacts.map((user, index) => (
                            <SelectContactItem userId={user.userId} key={index} _id={user._id} avatar={user.avatar} searchTag={user.searchTag} />
                        ))
                    }
                </div>
            </div>
        </section>
    )
}

const AddContactGroupModel = ({ open, setOpen }: {
    open: boolean;
    setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
    const tempUsers = useAppSelector((state) => state.temp.tempUser)
    const groups = useAppSelector((state) => state.auth.groups)

    function submit() {
        setOpen(false)
    }
    return (
        <section className={`absolute w-full h-full bg-[#2342708a] ${open ? 'flex' : 'hidden'} justify-center items-center flex-col`}>
            <div className="min-h-[90%] w-[90%] flex flex-col items-center bg-slate-800 rounded-md overflow-hidden">
                <div className="w-full flex justify-between h-12 items-center px-2 bg-slate-900">
                    <div className="">Report</div>
                    <div className="flex gap-1">
                        <button className="w-[5rem] text-sm h-[1.6rem] cursor-pointer bg-pink-500 hover:bg-red-500 rounded-md" onClick={() => setOpen(false)}>CLose</button>
                        <button className="w-[5rem] text-sm h-[1.6rem] cursor-pointer bg-pink-500 hover:bg-red-500 rounded-md" disabled={tempUsers.length < 1} onClick={() => submit()}>done</button>
                    </div>
                </div>
                <div className=" w-full flex flex-col items-center justify-center">
                    {
                        groups.map((user, index) => (
                            <SelectContactItem userId={user._id} key={index} _id={user._id} avatar={user.avatar} searchTag={user.groupName} />
                        ))
                    }
                </div>
            </div>
        </section>
    )
}

const Help = () => {
    const disp = useAppDispatch()
    const router = useNavigate()
    const [report, setReport] = useState<reportType>({
        name: '',
        message: ""
    })
    const [openContact, setOpenContact] = useState<boolean>(false)
    const [openGroups, setOpenGroups] = useState<boolean>(false)
    const [openSuccess, setSuccess] = useState<boolean>(false)
    const selctedUser = useAppSelector((state) => state.temp.tempUser)

    function handleSelctType(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) {
        if (e.target.name === 'message') {
            setReport({ ...report, message: e.target.value })
        } else {
            setReport({ ...report, name: e.target.id })
        }
    }

    async function submitTrubel(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (report.name) {
            try {
                await axios.post(`${api}/report/report`, {
                    reportType: report.name,
                    Users: selctedUser,
                    message: report.message
                }, { withCredentials: true })

                disp(clearTemp())
                setReport({
                    message: "",
                    name: ""
                })
                setSuccess(true)


            } catch (error) {
                console.log(`error in submit reports ${error}`);
            }
        }
    }


    async function quit() {
        disp(clearTemp())
        setReport({
            message: "",
            name: ""
        })
        router('/user', {replace: true})
    }

    return (
        <>
            <SuccessModal open={openSuccess} />
            <AddContactModel open={openContact} setOpen={setOpenContact} />
            <AddContactGroupModel open={openGroups} setOpen={setOpenGroups} />
            {/* <SuccessModal /> */}
            <section className="w-full min-h-[100vh] overflow-y-auto gap-[1rem] py-[2rem] flex justify-center rounded-sm">
                <section className="w-[90%] h-[98%] bg-slate-800 flex  flex-col gap-2 mt-3 md:w-[80%] lg:w-[60%] rounded-md pb-4">
                    <section className="w-full h-[15%] bg-slate-900 grid grid-cols-[2fr_8fr] gap-2 items-center justify-center px-3 pb-2 overflow-hidden">
                        <div className="">
                            <TfiHelpAlt size={40} cursor={'pointer'} />
                        </div>
                        <div className="">
                            <h1 className="text-2xl font-bold">Report trouble?</h1>
                        </div>
                    </section>
                    <section className="w-full min-h-[85%] mt-2 flex justify-center items-center rounded-md overflow-hidden">
                        <form className="w-[95%] h-full " onSubmit={submitTrubel}>
                            <div className="w-full flex justify-start items-end flex-col gap-[2rem]">
                                <div className="w-full flex justify-between items-center flex-row-reverse gap-2">
                                    <label htmlFor="spam" className="text-xl font-mono">Report Spam Activity</label>
                                    <input type="radio" onChange={handleSelctType} name="report" id="spam" className="" />
                                </div>
                                {
                                    report.name === "spam" && (
                                        <div className="w-full flex items-center flex-col justify-center gap-4">
                                            <button type="button" className="w-[90%] bg-fuchsia-500 font-bold text-lg rounded-md cursor-pointer hover:bg-fuchsia-600" onClick={() => setOpenContact(true)}>Select From Contacts</button>
                                            <button type="button" className="w-[90%] bg-fuchsia-500 font-bold text-lg rounded-md cursor-pointer hover:bg-fuchsia-600" onClick={() => setOpenGroups(true)}>Select From Groups</button>
                                        </div>
                                    )
                                }
                                <div className="w-full flex justify-between items-center flex-row-reverse gap-2">
                                    <label htmlFor="harm" className="text-xl font-mono">Harmful Content Share</label>
                                    <input type="radio" onChange={handleSelctType} name="report" id="harm" />
                                </div>
                                {
                                    report.name === "harm" && (
                                        <div className="w-full flex items-center flex-col justify-center gap-4">
                                            <button type="button" className="w-[90%] bg-fuchsia-500 font-bold text-lg rounded-md cursor-pointer hover:bg-fuchsia-600" onClick={() => setOpenContact(true)}>Select From Contacts</button>
                                            <button type="button" className="w-[90%] bg-fuchsia-500 font-bold text-lg rounded-md cursor-pointer hover:bg-fuchsia-600" onClick={() => setOpenGroups(true)}>Select From Groups</button>
                                        </div>
                                    )
                                }
                                <div className="w-full flex justify-between items-center flex-row-reverse gap-2">
                                    <label htmlFor="slow" className="text-xl font-mono">Lagging or Poor exprince</label>
                                    <input type="radio" onChange={handleSelctType} name="report" id="exprince" />
                                </div>
                                <div className="w-full flex justify-between items-center flex-row-reverse gap-2">
                                    <label htmlFor="hacked" className="text-xl font-mono">Id hacked</label>
                                    <input type="radio" onChange={handleSelctType} name="report" id="hacked" />
                                </div>
                                <div className="w-full flex justify-between items-center flex-row-reverse gap-2">
                                    <label htmlFor="custome" className="text-xl font-mono">Report Bug (Other)</label>
                                    <input type="radio" onChange={handleSelctType} name="report" id="custom" />
                                </div>
                                <div className="w-full flex justify-center items-start flex-col gap-2 md:items-end">
                                    <label htmlFor="message" className="text-xl font-mono">Report Message</label>
                                    <textarea placeholder="enter your message (Optional)" onChange={handleSelctType} name="message" id="message" className="w-full border-1 border-amber-600 rounded-sm resize-none min-h-[5rem] md:w-[50%]" />
                                </div>
                                <div className="w-full flex justify-center items-center flex-row-reverse gap-2">
                                    <button onClick={() => quit()} type="button" className="w-[4rem] h-[1.5rem] cursor-pointer bg-violet-500 rounded-sm">Cancel</button>
                                    <button disabled={!report.name} type="submit" className="w-[4rem] h-[1.5rem] cursor-pointer bg-emerald-400 rounded-sm disabled:bg-emerald-800">Submit</button>
                                </div>
                            </div>
                        </form>
                    </section>
                </section>
            </section>
        </>

    )
}

export default Help