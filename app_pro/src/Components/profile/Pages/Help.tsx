import React, { useState } from "react"
import { TfiHelpAlt } from "react-icons/tfi"

interface reportType {
    name: string;
    message: string;
}

const SuccessModal = () =>{
    return(
        <section className="w-full h-full absolute z-10 top-0 flex justify-center items-center bg-[#342f41b8]">
            <div className="w-[80%] h-[30%] flex flex-col justify-center items-center gap-2 bg-sky-800 rounded-md">
                <p className="text-xl items-center text-center">Thanks for your feedback, we will fix it soon</p>
                <button className="w-[4rem] h-[1.5rem] cursor-pointer bg-amber-600 rounded-sm">OK</button>
            </div>
        </section>
    )
}

const Help = () => {

    const [report, setReport] = useState<reportType | object>({})

    function handleSelctType(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) {
        if (e.target.name === 'message') {
            setReport({ ...report, message: e.target.value })
        } else {
            setReport({ ...report, name: e.target.id })
        }
    }

    return (
        <>
        {/* <SuccessModal /> */}
        <section className="w-full h-[100vh] overflow-y-auto flex justify-center rounded-sm">
            <section className="w-[90%] h-[98%] bg-slate-800 flex  flex-col gap-2 mt-3 md:w-[98%]">
                <section className="w-full h-[15%] bg-slate-900 grid grid-cols-[2fr_8fr] gap-2 items-center justify-center px-3">
                    <div className="">
                        <TfiHelpAlt size={40} cursor={'pointer'} />
                    </div>
                    <div className="">
                        <h1 className="text-2xl font-bold">Report trouble?</h1>
                    </div>
                </section>
                <section className="w-full min-h-[85%] mt-2 rounded-[10px_10px_0_0] flex justify-center items-center">
                    <form className="w-[95%] h-full ">
                        <div className="w-full flex justify-start items-end flex-col gap-[2rem]">
                            <div className="w-full flex justify-between items-center flex-row-reverse gap-2">
                                <label htmlFor="spam" className="text-xl font-mono">Report Spam Activity</label>
                                <input type="radio" onChange={handleSelctType} name="report" id="spam" className="" />
                            </div>
                            <div className="w-full flex justify-between items-center flex-row-reverse gap-2">
                                <label htmlFor="harm" className="text-xl font-mono">Harmful Content Serve</label>
                                <input type="radio" onChange={handleSelctType} name="report" id="harm" />
                            </div>
                            <div className="w-full flex justify-between items-center flex-row-reverse gap-2">
                                <label htmlFor="slow" className="text-xl font-mono">Lagging or Poor exprince</label>
                                <input type="radio" onChange={handleSelctType} name="report" id="slow" />
                            </div>
                            <div className="w-full flex justify-between items-center flex-row-reverse gap-2">
                                <label htmlFor="hacked" className="text-xl font-mono">Id hacked</label>
                                <input type="radio" onChange={handleSelctType} name="report" id="hacked" />
                            </div>
                            <div className="w-full flex justify-between items-center flex-row-reverse gap-2">
                                <label htmlFor="custome" className="text-xl font-mono">Report Bug (Other)</label>
                                <input type="radio" onChange={handleSelctType} name="report" id="custome" />
                            </div>
                            <div className="w-full flex justify-center items-start flex-col gap-2">
                                <label htmlFor="message" className="text-xl font-mono">Report Message</label>
                                <textarea placeholder="enter your message (Optional)" onChange={handleSelctType} name="message" id="message" className="w-full border-1 border-amber-600 rounded-sm resize-none min-h-[5rem]" />
                            </div>
                            <div className="w-full flex justify-center items-center flex-row-reverse gap-2">
                                <button type="submit" className="w-[4rem] h-[1.5rem] cursor-pointer bg-emerald-400 rounded-sm">Submit</button>
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