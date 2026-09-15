import React, { useState, type SetStateAction } from "react"
import { TfiHelpAlt } from "react-icons/tfi"
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import x from "../../../assets/no_dp.png"
import { clearTemp, setTempUser } from "../../../app/functions/temp";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const api = import.meta.env.VITE_API;

interface reportType {
    name: string;
    message: string;
}

const SuccessModal = ({ open }: { open: boolean; }) => {
    if (!open) return null;

    return (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl glass-panel p-6 shadow-2xl border border-white/15 text-center space-y-4">
                <div className="w-12 h-12 rounded-full accent-bg text-black flex items-center justify-center mx-auto font-bold text-xl">✓</div>
                <h3 className="text-lg font-bold text-[var(--c-text-primary)]">Feedback Received</h3>
                <p className="text-xs text-[var(--c-text-muted)]">Thank you for reporting. Our team will review this issue promptly.</p>
                <button 
                    className="w-full h-10 accent-bg text-black font-bold text-xs rounded-xl shadow-md cursor-pointer hover:brightness-110 transition" 
                    onClick={() => window.location.pathname = "/"}
                >
                    Return to App
                </button>
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
            <p className="text-sm font-semibold text-[var(--c-text-primary)] truncate flex-1">{searchTag}</p>
        </div>
    )
}

const AddContactModel = ({ open, setOpen }: {
    open: boolean;
    setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
    const contacts = useAppSelector((state) => state.auth.contacts)

    if (!open) return null;

    return (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl glass-panel shadow-2xl overflow-hidden border border-white/15">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h3 className="text-base font-bold text-[var(--c-text-primary)]">Select Contact to Report</h3>
                    <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer" onClick={() => setOpen(false)}>Done</button>
                </div>
                <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                    {contacts.map((user, index) => (
                        <SelectContactItem userId={user.userId} key={index} _id={user._id} avatar={user.avatar} searchTag={user.searchTag} />
                    ))}
                </div>
            </div>
        </section>
    )
}

const AddContactGroupModel = ({ open, setOpen }: {
    open: boolean;
    setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
    const groups = useAppSelector((state) => state.auth.groups)

    if (!open) return null;

    return (
        <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl glass-panel shadow-2xl overflow-hidden border border-white/15">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h3 className="text-base font-bold text-[var(--c-text-primary)]">Select Group to Report</h3>
                    <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer" onClick={() => setOpen(false)}>Done</button>
                </div>
                <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                    {groups.map((user, index) => (
                        <SelectContactItem userId={user._id} key={index} _id={user._id} avatar={user.avatar} searchTag={user.groupName} />
                    ))}
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

    const reportOptions = [
        { id: 'spam', label: 'Report Spam Activity' },
        { id: 'harm', label: 'Harmful Content Share' },
        { id: 'exprince', label: 'Lagging or Poor Experience' },
        { id: 'hacked', label: 'Account Security / Hacked' },
        { id: 'custom', label: 'Report Bug (Other)' }
    ];

    return (
        <>
            <SuccessModal open={openSuccess} />
            <AddContactModel open={openContact} setOpen={setOpenContact} />
            <AddContactGroupModel open={openGroups} setOpen={setOpenGroups} />

            <section className="w-full min-h-screen py-6 flex justify-center overflow-y-auto">
                <section className="w-[95%] lg:w-[70%] max-w-3xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                        <div className="p-3 rounded-2xl accent-bg text-black shadow-lg">
                            <TfiHelpAlt size={26} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--c-text-primary)]">Report Trouble & Support</h1>
                            <p className="text-xs text-[var(--c-text-muted)]">Describe issues or policy violations for immediate support</p>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={submitTrubel}>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-wider">Select Issue Category</label>
                            
                            <div className="space-y-2">
                                {reportOptions.map((opt) => (
                                    <div key={opt.id} className="space-y-2">
                                        <label 
                                            htmlFor={opt.id}
                                            className={`glass-card p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition ${
                                                report.name === opt.id ? 'border-[var(--c-accent)] bg-[var(--c-accent)]/10' : 'border-white/10 hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="text-sm font-semibold text-[var(--c-text-primary)]">{opt.label}</span>
                                            <input 
                                                type="radio" 
                                                onChange={handleSelctType} 
                                                name="report" 
                                                id={opt.id} 
                                                checked={report.name === opt.id}
                                                className="accent-[var(--c-accent)] w-4 h-4 cursor-pointer" 
                                            />
                                        </label>

                                        {(report.name === 'spam' || report.name === 'harm') && report.name === opt.id && (
                                            <div className="flex gap-2 pl-4 pt-1 animate-in fade-in duration-150">
                                                <button 
                                                    type="button" 
                                                    className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[var(--c-text-primary)] transition cursor-pointer border border-white/10" 
                                                    onClick={() => setOpenContact(true)}
                                                >
                                                    Attach Contact
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[var(--c-text-primary)] transition cursor-pointer border border-white/10" 
                                                    onClick={() => setOpenGroups(true)}
                                                >
                                                    Attach Group
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Description Textarea */}
                        <div className="space-y-2">
                            <label htmlFor="message" className="text-xs font-bold text-[var(--c-text-muted)] uppercase tracking-wider">Report Description (Optional)</label>
                            <textarea 
                                placeholder="Describe details, steps to reproduce, or relevant context..." 
                                onChange={handleSelctType} 
                                name="message" 
                                id="message" 
                                className="w-full glass-card p-4 border border-white/15 rounded-2xl text-xs text-[var(--c-text-primary)] placeholder:text-[var(--c-text-muted)] focus:outline-none focus:border-[var(--c-accent)] resize-none h-28" 
                            />
                        </div>

                        {/* Submit Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button 
                                onClick={quit} 
                                type="button" 
                                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                disabled={!report.name} 
                                type="submit" 
                                className="px-6 py-2.5 rounded-xl accent-bg text-black font-extrabold text-xs shadow-lg hover:brightness-110 transition disabled:opacity-40 cursor-pointer"
                            >
                                Submit Report
                            </button>
                        </div>
                    </form>
                </section>
            </section>
        </>
    )
}

export default Help