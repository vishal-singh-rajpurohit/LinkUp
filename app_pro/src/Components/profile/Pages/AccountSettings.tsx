import { useNavigate } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa";

const AccountSettings = () => {
  const router = useNavigate();

  return (
    <section className="w-full min-h-screen py-6 flex justify-center overflow-y-auto">
      <section className="w-[95%] lg:w-[70%] max-w-3xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
          <button 
            type="button" 
            onClick={() => router('/user/settings')} 
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--c-text-primary)] transition cursor-pointer"
          >
            <FaAngleLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--c-text-primary)]">Account Settings</h1>
            <p className="text-xs text-[var(--c-text-muted)]">Manage advanced security & preferences</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl accent-bg text-black font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">⚙️</div>
          <h3 className="text-base font-bold text-[var(--c-text-primary)]">Account Preferences</h3>
          <p className="text-xs text-[var(--c-text-muted)] max-w-md mx-auto">
            Your primary account settings and multi-theme configurations can be managed directly under the 
            <span className="accent-text font-bold"> Settings & Themes</span> page.
          </p>
          <button
            type="button"
            onClick={() => router('/user/settings')}
            className="px-5 py-2 rounded-xl accent-bg text-black font-extrabold text-xs shadow-md hover:brightness-110 transition cursor-pointer mt-2"
          >
            Go to Main Settings
          </button>
        </div>
      </section>
    </section>
  )
}

export default AccountSettings