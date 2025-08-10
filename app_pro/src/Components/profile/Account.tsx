
import x from '../../assets/no_dp.png'
import { FaAngleRight } from "react-icons/fa6"
import { HiLocationMarker } from "react-icons/hi"
import { BiChat, BiExit, BiUser } from "react-icons/bi"
import { FcSettings } from "react-icons/fc"
import { FaAngleLeft } from "react-icons/fa"
import { NavLink, useNavigate } from "react-router-dom"
import { IoHelp, IoLogOut } from "react-icons/io5"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { logOut } from "../../app/functions/auth"
import { clearTemp } from "../../app/functions/temp"
import { setSearching } from "../../app/functions/triggers"
import axios from "axios"

const api = import.meta.env.VITE_API

export const Account = () => {
  const router = useNavigate()
  const disp = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  async function logOutFunc() {
    try {
      await axios.post(`${api}/user/logout`, {}, { withCredentials: true });
      disp(logOut())
      disp(clearTemp())
      disp(setSearching({ trigger: false }))
      window.location.pathname = "/"
    } catch (error) {
      console.log(`Error in logout ${error}`);
    }

  }

  return (
    <section className="w-full h-[100vh] overflow-y-auto flex justify-center rounded-sm">
      <section className="w-full h-full flex items-center justify-center md:gap-2 md:grid md:grid-cols-[3fr_7fr]">
        {/* left part : Naviation part*/}
        <section className="hidden w-full h-[98%] items-center justify-center md:flex">
          <div className="w-[90%] h-full bg-slate-800 rounded-md flex flex-col gap-1">
            <div className="cursor-pointer w-[100%] h-[4rem] bg-slate-900 px-[2%] grid grid-cols-[2fr_8fr] gap-1 items-center justify-center hover:bg-[#4a697894]">
              <div className="text-gray-300 flex items-center justify-between"><BiChat size={20} /></div>
              <div className="w-full">
                <div className="text-[18px] font-mono">Chats</div>
                <div className="text-[15px]">Find your chats</div>
              </div>
            </div>
            <div className="cursor-pointer w-[100%] h-[4rem] bg-slate-900 px-[2%] grid grid-cols-[2fr_8fr] gap-1 items-center justify-center hover:bg-[#4a697894]">
              <div className="text-gray-300 flex items-center justify-between"><BiUser size={20} /></div>
              <div className="w-full ">
                <div className="text-[18px] font-mono">Account</div>
                <div className="text-[15px]">Your Profile</div>
              </div>
            </div>
            <div onClick={()=>router('/user/help')} className="cursor-pointer w-[100%] h-[4rem] bg-slate-900 px-[2%] grid grid-cols-[2fr_8fr] gap-1 items-center justify-center hover:bg-[#4a697894]">
              <div className="text-gray-300 flex items-center justify-between"><IoHelp size={20} /></div>
              <div className="w-full ">
                <div className="text-[18px] font-mono">Help</div>
                <div className="text-[15px]">Need Help?</div>
              </div>
            </div>
            <div className="cursor-pointer w-[100%] h-[4rem] bg-slate-900 px-[2%] grid grid-cols-[2fr_8fr] gap-1 items-center justify-center hover:bg-[#4a697894]" onClick={() => logOutFunc()}>
              <div className="text-gray-300 flex items-center justify-between"><IoLogOut size={20} /></div>
              <div className="w-full ">
                <div className="text-[18px] font-mono">Log Out</div>
                {/* <div className="text-[15px]">Need Help?</div> */}
              </div>
            </div>
          </div>
        </section>
        {/* The top part will remain same for both */}
        <section className="w-[90%] h-[98%] flex flex-col gap-2 md:w-[98%]">
          <div className="w-full grid grid-cols-[0.3fr_9.7fr] pt-3 mt-1  bg-slate-800 rounded-[9px_9px_0_0]">
            <div className="pt-2 pl-1"><NavLink to={'/'} ><FaAngleLeft size={20} /></NavLink></div>
            <div className="w-full flex flex-col justify-center items-center gap-3">
              <div className="w-full h-auto flex flex-col gap-1 justify-center items-center">
                <div className="bg-inherit w-[10rem] h-[10rem] rounded-[50%] overflow-hidden sha">
                  <img src={user.avatar || x} alt="profile picture" className="w-full h-auto" />
                </div>
                <div className="w-full flex flex-col gap-0.5 items-center justify-center">
                  <p className="text-[22px] font-bold">{user.userName}</p>
                  <div className="flex items-center justify-center gap-1 text-sm"><HiLocationMarker color="#c8bfbf" />NY, New Yourk City</div>
                </div>
              </div>
              <div className="w-full grid items-center justify-center grid-cols-[1fr_1fr]">
                <div className="w-full h-[5rem] flex justify-center flex-col  text-center border-t-2 border-r-2 border-gray-400">
                  <p className="text-[12px] md:text-[20px] font-bold">{user.email}</p>
                  <p className="text-[12px] md:text-[17px] ">Email</p>
                </div>
                <div className="w-full h-[5rem] flex justify-center flex-col  text-center border-t-2 border-l-2 border-gray-400">
                  <p className="text-[12px] md:text-[20px] font-bold">{user.searchTag}</p>
                  <p className="text-[12px] md:text-[17px] ">SearchTag</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-1 ">
            <div className="cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-1 items-center justify-center hover:bg-[#4a697894]">
              <div className="text-gray-300 flex items-center justify-between"><BiChat size={20} /></div>
              <div className="w-full ">
                <div className="text-[18px] font-mono">Chat</div>
                <div className="text-[15px]">Find your chats</div>
              </div>
              <div className="text-lg"><FaAngleRight /></div>
            </div>
            <div className="cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-2 items-center justify-center hover:bg-[#4a697894]">
              <div className="text-gray-300 flex items-center justify-between"><BiUser size={20} /></div>
              <div className="w-full ">
                <div className="text-[18px] font-mono">Account</div>
                <div className="text-[15px]">Your Account Settings</div>
              </div>
              <div className="text-lg"><FaAngleRight /></div>
            </div>
            <div className="cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-2 items-center justify-center hover:bg-[#4a697894]">
              <div className="text-gray-300 flex items-center justify-between"><FcSettings size={20} /></div>
              <div className="w-full ">
                <div className="text-[18px] font-mono">Settings</div>
                <div className="text-[15px]">Themes and more</div>
              </div>
              <div className="text-lg"><FaAngleRight /></div>
            </div>
            <div onClick={()=>router('/user/help')} className="cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-2 items-center justify-center hover:bg-[#4a697894]">
              <div className="text-gray-300 flex items-center justify-between"><IoHelp size={20} /></div>
              <div className="w-full ">
                <div className="text-[18px] font-mono">Help</div>
                <div className="text-[15px]">Need Help?</div>
              </div>
              <div className="text-lg"><FaAngleRight /></div>
            </div>
            <div className="cursor-pointer w-[100%] h-[4rem] px-[5%] grid grid-cols-[1fr_8fr_1fr] gap-2 items-center justify-center hover:bg-[#4a697894]" onClick={() => logOutFunc()}>
              <div className="text-gray-300 flex items-center justify-between"><IoLogOut size={20} /></div>
              <div className="w-full ">
                <div className="text-[18px] font-mono">Log Out</div>
                {/* <div className="text-[15px]">Need Help?</div> */}
              </div>
              <div className="text-lg"><BiExit /></div>
            </div>
          </div>
        </section>
      </section>
    </section>
  )
}
