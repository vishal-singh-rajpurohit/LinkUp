import { BiBlock, BiChat, BiUser } from "react-icons/bi"
import { FaAngleLeft, FaAngleRight } from "react-icons/fa"
import { FcSettings } from "react-icons/fc"
import { HiLocationMarker } from "react-icons/hi"
import { RiArchive2Line } from "react-icons/ri"
import { NavLink } from "react-router-dom"
import x from '../../assets/no_dp.png'


const Friend = () => {
    return (
        <section className="w-full h-[100vh] overflow-y-auto flex justify-center rounded-sm">
            {/* <section className="w-full h-full flex items-center justify-center md:gap-2 md:grid md:grid-cols-[3fr_7fr]"> */}
                <section className="w-[90%] h-[98%] flex flex-col gap-2 md:w-[98%]">
                    <div className="w-full grid grid-cols-[0.3fr_9.7fr] pt-3 mt-1  bg-slate-800 rounded-[9px_9px_0_0]">
                        <div className="pt-2 pl-1"><NavLink to={'/'} ><FaAngleLeft size={20} /></NavLink></div>
                        <div className="w-full flex flex-col justify-center items-center gap-3">
                            <div className="w-full h-auto flex flex-col gap-1 justify-center items-center">
                                <div className="bg-inherit w-[10rem] h-[10rem] rounded-[50%] overflow-hidden sha">
                                    <img src={x} alt="profile picture" className="w-full h-auto" />
                                </div>
                                <div className="w-full flex flex-col gap-0.5 items-center justify-center">
                                    <p className="text-[22px] font-bold">Tony Stark</p>
                                    <div className="flex items-center justify-center gap-1 text-sm"><HiLocationMarker color="#c8bfbf" />NY, New Yourk City</div>
                                </div>
                            </div>
                            <div className="w-full grid items-center justify-center grid-cols-[1fr_1fr]">
                                <div className="w-full h-[5rem] text-center border-t-2 border-r-2 border-gray-400">
                                    <p className="text-[20px] font-bold">10</p>
                                    <p className="text-[17px] ">Links</p>
                                </div>
                                <div className="w-full h-[5rem] text-center border-t-2 border-l-2 border-gray-400"> 
                                    <p className="text-[14px] ">myyadav@gmail.com</p>
                                    <p className="text-[14px] ">my_yadav</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-col items-center justify-center gap-1 ">
                        <div className="w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-1 items-center justify-center hover:bg-[#4a697894]">
                            <div className="text-gray-300 flex items-center justify-between"><RiArchive2Line size={20} /></div>
                            <div className="w-full ">
                                <div className="text-[18px] font-mono">Archive</div>
                                <div className="text-[15px]">Achive Chat</div>
                            </div>
                        </div>
                        <div className="w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-2 items-center justify-center hover:bg-[#4a697894]">
                            <div className="text-gray-300 flex items-center justify-between"><BiBlock size={20} /></div>
                            <div className="w-full ">
                                <div className="text-[18px] font-mono">Block</div>
                                <div className="text-[15px]">Block this user</div>
                            </div>
                        </div>
                    </div>
                </section>
            {/* </section> */}
        </section>
    )
}

export default Friend