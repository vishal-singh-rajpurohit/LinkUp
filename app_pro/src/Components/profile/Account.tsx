import x from '../../assets/no_dp.png'
import { FaAngleRight } from "react-icons/fa6"
import { HiLocationMarker } from "react-icons/hi"
import { BiChat, BiExit } from "react-icons/bi"
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
    <section className="w-full min-h-screen py-4 flex justify-center overflow-y-auto">
      <section className="w-[95%] lg:w-[80%] max-w-5xl glass-panel rounded-3xl border border-white/10 shadow-2xl p-4 md:p-6 space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <NavLink to={'/'} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--c-text-primary)] transition">
              <FaAngleLeft size={20} />
            </NavLink>
            <div>
              <h1 className="text-xl font-bold text-[var(--c-text-primary)]">User Profile</h1>
              <p className="text-xs text-[var(--c-text-muted)]">Account overview and system actions</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col items-center text-center space-y-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[var(--c-accent)] shadow-2xl bg-slate-700">
            <img src={user.avatar || x} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[var(--c-text-primary)]">{user.userName}</h2>
            <p className="text-xs accent-text font-semibold mt-0.5">@{user.searchTag}</p>
            <div className="flex items-center justify-center gap-1 text-xs text-[var(--c-text-muted)] mt-1">
              <HiLocationMarker size={14} className="accent-text" />
              <span>NY, New York City</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-white/10">
            <div className="glass-card p-3 rounded-xl border border-white/10 text-center">
              <p className="text-xs font-semibold text-[var(--c-text-primary)] truncate">{user.email}</p>
              <p className="text-[10px] text-[var(--c-text-muted)] uppercase tracking-wider">Email Address</p>
            </div>
            <div className="glass-card p-3 rounded-xl border border-white/10 text-center">
              <p className="text-xs font-semibold text-[var(--c-text-primary)] truncate">{user.searchTag}</p>
              <p className="text-[10px] text-[var(--c-text-muted)] uppercase tracking-wider">Search Tag</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <div className="space-y-2">
          <div 
            onClick={() => router('/')}
            className="glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl accent-bg text-black shadow-md"><BiChat size={20} /></div>
              <div>
                <p className="text-sm font-bold text-[var(--c-text-primary)]">Chats & Messages</p>
                <p className="text-xs text-[var(--c-text-muted)]">Return to active conversations</p>
              </div>
            </div>
            <FaAngleRight className="text-[var(--c-text-muted)] group-hover:translate-x-1 transition" size={16} />
          </div>

          <div 
            onClick={() => router('/user/settings')}
            className="glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30"><FcSettings size={20} /></div>
              <div>
                <p className="text-sm font-bold text-[var(--c-text-primary)]">Settings & Themes</p>
                <p className="text-xs text-[var(--c-text-muted)]">Customize visual presets and account details</p>
              </div>
            </div>
            <FaAngleRight className="text-[var(--c-text-muted)] group-hover:translate-x-1 transition" size={16} />
          </div>

          <div 
            onClick={() => router('/user/help')}
            className="glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/10 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30"><IoHelp size={20} /></div>
              <div>
                <p className="text-sm font-bold text-[var(--c-text-primary)]">Help & Support</p>
                <p className="text-xs text-[var(--c-text-muted)]">Need assistance or reporting issues</p>
              </div>
            </div>
            <FaAngleRight className="text-[var(--c-text-muted)] group-hover:translate-x-1 transition" size={16} />
          </div>

          <div 
            onClick={logOutFunc}
            className="glass-card p-4 rounded-2xl border border-red-500/20 flex items-center justify-between cursor-pointer hover:bg-red-500/10 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30"><IoLogOut size={20} /></div>
              <div>
                <p className="text-sm font-bold text-red-400">Log Out</p>
                <p className="text-xs text-[var(--c-text-muted)]">Safely end your current session</p>
              </div>
            </div>
            <BiExit className="text-red-400 group-hover:translate-x-1 transition" size={18} />
          </div>
        </div>
      </section>
    </section>
  )
}

export default Account;
