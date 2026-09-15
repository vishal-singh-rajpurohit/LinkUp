import { NavLink } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import x from "../../../assets/no_dp.png"
import { FaAngleLeft, FaRegEye, FaPalette, FaCheck, FaLock, FaShieldAlt } from "react-icons/fa"
import { HiLocationMarker } from "react-icons/hi"
import { useEffect, useRef, useState, type SetStateAction } from "react"
import { setSecourityAnswer, setSecourityQuestion, setTheme, updateEmail, updateName, updateSearchTag, type userType } from "../../../app/functions/auth"
import { GoVerified } from "react-icons/go"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { FcCancel } from "react-icons/fc"
import { FaCircleInfo } from "react-icons/fa6"
import axios from "axios"
import { SampleCropper } from "../../Cropper/Cropper"
import { useTheme, type ThemePreset } from "../../../context/ThemeContext"

const api = import.meta.env.VITE_API;

interface copyUserInterface {
  tagError: number;
  mailError: number;
}

const AnsModel = ({ open, setOpen }: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const ans = useAppSelector((state) => state.auth.user.answer)
  return (
    <section onClick={() => setOpen(false)} className={`fixed ${open ? 'flex' : 'hidden'} items-center justify-center z-50 top-0 left-0 h-full w-full bg-black/70 backdrop-blur-md`}>
      <div className="w-[22rem] p-6 justify-center items-center flex flex-col glass-panel rounded-2xl border border-white/15 gap-3 shadow-2xl text-center">
        <h3 className="text-lg font-bold text-amber-400">Security Answer Secret</h3>
        <p className="text-xs text-[var(--c-text-muted)]">Do not share this with anyone!</p>
        <div className="w-full py-3 px-4 glass-card rounded-xl text-emerald-400 font-mono text-lg font-bold border border-emerald-500/30">
          {ans}
        </div>
      </div>
    </section>
  )
}

const VerifyModel = ({ open, setOpen }: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const [password, setPassword] = useState<string>("")
  const disp = useAppDispatch()

  async function submit() {
    if (password.length) {
      try {
        const resp = await axios.post<{ data: { question: string } }>(`${api}/user/verify`, { password }, { withCredentials: true })
        disp(setSecourityAnswer({ ans: resp.data.data.question }))
      } catch (error) {
        console.log(`error in verify: ${error}`);
      }
    }
  }

  return (
    <section className={`fixed ${open ? 'flex' : 'hidden'} items-center justify-center z-50 top-0 left-0 h-full w-full bg-black/70 backdrop-blur-md`}>
      <div className="w-[22rem] p-6 justify-center items-center flex flex-col glass-panel rounded-2xl border border-white/15 gap-4 shadow-2xl">
        <div className="p-3 rounded-full accent-bg text-black"><FaLock size={20} /></div>
        <div className="text-center">
          <h3 className="text-base font-bold text-[var(--c-text-primary)]">Verify Identity</h3>
          <p className="text-xs text-[var(--c-text-muted)] mt-0.5">Enter your account password to reveal security answer</p>
        </div>
        <input 
          type="password" 
          className="w-full h-10 glass-card px-3 text-sm text-[var(--c-text-primary)] rounded-xl outline-none border border-white/10 focus:border-[var(--c-accent)] transition" 
          placeholder="Enter password..." 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        <div className="flex gap-2 w-full">
          <button onClick={submit} className="flex-1 h-9 accent-bg text-black font-bold text-xs rounded-xl hover:brightness-110 transition cursor-pointer">Verify</button>
          <button onClick={() => setOpen(false)} className="flex-1 h-9 bg-white/10 text-white font-medium text-xs rounded-xl hover:bg-white/15 transition cursor-pointer">Close</button>
        </div>
      </div>
    </section>
  )
}

const Settings = () => {
  const disp = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const verifed = useAppSelector((state) => state.auth.user.isVerified)
  const dpRef = useRef<HTMLInputElement | null>(null)

  const { theme, setThemePreset, themes } = useTheme();

  const [changeMode, setChangeMode] = useState<boolean>(false)
  const [openEditor, setOpenEditor] = useState<boolean>(false)
  const [tempAvatar, setTempAvatar] = useState<string>('');
  const [copyUser, setCopyUser] = useState<userType>(
    {
      _id: "",
      avatar: "",
      userName: "",
      email: "",
      searchTag: "",
      socketId: "",
      theme: false,
      isVerified: false,
      question: "",
      answer: ""
    },
  )

  const [copyUserErr, setCopyUserErr] = useState<copyUserInterface>({
    mailError: 1,
    tagError: 1
  })

  const [openAns, setOpenAns] = useState<boolean>(false)

  const [quiz, setQuiz] = useState<{
    question: string;
    ans: string;
  }>({
    ans: "",
    question: ""
  })

  async function checkSearchTag(tag: string) {
    setCopyUserErr({
      ...copyUserErr,
      tagError: 2
    })
    try {
      await axios.post(`${api}/user/live-check-searchtag`, {
        searchTag: tag
      }, { withCredentials: true })

      setCopyUserErr({
        ...copyUserErr,
        tagError: 1
      })

    } catch (error) {
      setCopyUserErr({
        ...copyUserErr,
        tagError: 3
      })
    }
  }

  async function checkEmail(mail: string) {
    setCopyUserErr({
      ...copyUserErr,
      mailError: 2
    })
    try {
      await axios.post(`${api}/user/live-check-mail`, {
        email: mail
      }, { withCredentials: true })
      setCopyUserErr({
        ...copyUserErr,
        mailError: 1
      })
    } catch (error) {
      setCopyUserErr({
        ...copyUserErr,
        mailError: 3
      })
    }
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCopyUser({
      ...copyUser, [e.target.name]:
        (e.target.name === 'searchTag' || e.target.name === 'email') ? e.target.value.trim() : e.target.value
    })
    if (e.target.value.length > 2) {
      if (changeMode) {
        if (user.searchTag !== copyUser.searchTag) {
          await checkSearchTag(e.target.value)
          setCopyUser({ ...copyUser, [e.target.name]: e.target.value })
        }

        if (user.email !== copyUser.email) {
          await checkEmail(e.target.value)
          setCopyUser({ ...copyUser, [e.target.name]: e.target.value })
        }
      }
    }
  }

  async function changeThemeApi(presetId: ThemePreset) {
    setThemePreset(presetId);
    try {
      await axios.get(`${api}/user/set-theme`, { withCredentials: true })
      disp(setTheme())
    } catch (error) {
      console.log(`error changing theme ${error}`);
    }
  }

  useEffect(() => {
    setCopyUser({ ...user })
  }, [user])

  function handelCancel() {
    setCopyUser({
      ...user
    })
    setCopyUserErr({
      mailError: 1,
      tagError: 1
    })

    setChangeMode(false)
  }

  interface updateTypes {
    data: {
      searchTag?: string;
      email?: string;
      userName?: string;
    }
  }

  async function saveTag() {
    if (copyUser.searchTag !== user.searchTag) {
      try {
        const resp = await axios.post<updateTypes>(`${api}/user/update-searchtag`, {
          searchTag: copyUser.searchTag
        }, { withCredentials: true })
        disp(updateSearchTag({ tag: (resp.data.data.searchTag || copyUser.searchTag) }))
        setCopyUser({ ...copyUser, searchTag: (resp.data.data.searchTag || copyUser.searchTag) })
      } catch (error) {
        console.log(`error in saving tag ${JSON.stringify(error, null, 2)}`);
      }
    }
  }

  async function saveMail() {
    if (copyUser.email !== user.email) {
      try {
        const resp = await axios.post<updateTypes>(`${api}/user/update-mail`, {
          email: copyUser.email
        }, { withCredentials: true })
        disp(updateEmail({ mail: (resp.data.data.email || copyUser.email) }))
        setCopyUser({ ...copyUser, email: (resp.data.data.email || copyUser.email) })
      } catch (error) {
        console.log(`error in saving email ${error}`);
      }
    }
  }

  async function saveUserName() {
    if (copyUser.userName !== user.userName) {
      try {
        const resp = await axios.post<updateTypes>(`${api}/user/update-name`, {
          userName: copyUser.userName
        }, { withCredentials: true })
        disp(updateName({ name: (resp.data.data.userName || copyUser.userName) }))
        setCopyUser({ ...copyUser, userName: (resp.data.data.userName || copyUser.userName) })
      } catch (error) {
        console.log(`error in saving user name ${error}`);
      }
    }
  }

  async function save() {
    await saveTag();
    await saveUserName();
    await saveMail();
    setChangeMode(false)
  }

  async function submitQuiz() {
    if (quiz.question && quiz.ans) {
      try {
        const resp = await axios.post<{ data: { qu: string; } }>(`${api}/user/save-quiz`, {
          question: quiz.question,
          ans: quiz.ans
        }, { withCredentials: true })
        disp(setSecourityQuestion({ q: resp.data.data.qu }))
      } catch (error) {
        console.log(`error submit quiz ${error}`);
      }
    }
  }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (e.target.files && file) {
      const render = new FileReader()
      render.onload = () => {
        if (typeof render.result === 'string') {
          setTempAvatar(render.result)
        }
      }
      render.readAsDataURL(file)
    }
  }

  function avatarClick() {
    dpRef.current?.click()
  }

  useEffect(() => {
    if (Boolean(tempAvatar.trim().length)) {
      setOpenEditor(true)
    } else {
      setOpenEditor(false)
    }
  }, [tempAvatar, openEditor])

  return (
    <>
      <SampleCropper open={openEditor} image={tempAvatar} setImage={setTempAvatar} />
      <AnsModel setOpen={setOpenAns} open={openAns && verifed} />
      <VerifyModel setOpen={setOpenAns} open={openAns && !verifed} />

      <section className="w-full min-h-screen py-4 flex justify-center overflow-y-auto">
        <section className="w-[95%] lg:w-[80%] max-w-5xl glass-panel rounded-3xl border border-white/10 shadow-2xl p-4 md:p-6 space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <NavLink to={'/user'} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--c-text-primary)] transition">
                <FaAngleLeft size={20} />
              </NavLink>
              <div>
                <h1 className="text-xl font-bold text-[var(--c-text-primary)]">Account Settings</h1>
                <p className="text-xs text-[var(--c-text-muted)]">Manage profile parameters, visual themes, and safety credentials</p>
              </div>
            </div>

            {changeMode ? (
              <div className="flex items-center gap-2">
                <button onClick={handelCancel} className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer">
                  Cancel
                </button>
                <button 
                  disabled={copyUser.searchTag.length <= 2 || copyUser.email.length <= 2 || copyUser.userName.length < 3} 
                  onClick={save} 
                  className="px-4 py-1.5 rounded-xl accent-bg text-black font-bold text-xs shadow-md hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button onClick={() => setChangeMode(true)} className="px-4 py-1.5 rounded-xl accent-bg text-black font-bold text-xs shadow-md hover:brightness-110 transition cursor-pointer">
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Overview Card */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group cursor-pointer" onClick={avatarClick}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[var(--c-accent)] shadow-xl bg-slate-700">
                <img src={user.avatar || x} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                Change
              </div>
              <input ref={dpRef} onChange={handleAvatar} type="file" accept='image/*' className="hidden" />
            </div>

            <div className="flex-1 text-center md:text-left space-y-1">
              <h2 className="text-2xl font-extrabold text-[var(--c-text-primary)]">{user.userName}</h2>
              <div className="flex items-center justify-center md:justify-start gap-1 text-xs text-[var(--c-text-muted)]">
                <HiLocationMarker className="accent-text" size={14} />
                <span>@{user.searchTag}</span>
                <span className="mx-1">•</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
              <label htmlFor="searchTag" className="text-xs font-semibold text-[var(--c-text-muted)] flex items-center justify-between">
                <span>Search Tag</span>
                {copyUserErr.tagError === 1 && <GoVerified className="accent-text" title="Verified" />}
                {copyUserErr.tagError === 2 && <AiOutlineLoading3Quarters className="animate-spin accent-text" />}
                {copyUserErr.tagError === 3 && <FcCancel />}
              </label>
              <input 
                type="text" 
                disabled={!changeMode} 
                name="searchTag" 
                id="searchTag" 
                value={copyUser.searchTag} 
                onChange={handleChange}
                className="w-full h-9 glass-card px-3 text-sm text-[var(--c-text-primary)] rounded-xl outline-none border border-white/10 disabled:opacity-75 focus:border-[var(--c-accent)] transition" 
              />
            </div>

            <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
              <label htmlFor="userName" className="text-xs font-semibold text-[var(--c-text-muted)]">Full Name</label>
              <input 
                type="text" 
                disabled={!changeMode} 
                name="userName" 
                id="userName" 
                value={copyUser.userName} 
                onChange={handleChange}
                className="w-full h-9 glass-card px-3 text-sm text-[var(--c-text-primary)] rounded-xl outline-none border border-white/10 disabled:opacity-75 focus:border-[var(--c-accent)] transition" 
              />
            </div>

            <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
              <label htmlFor="email" className="text-xs font-semibold text-[var(--c-text-muted)] flex items-center justify-between">
                <span>Email Address</span>
                {copyUserErr.mailError === 1 && <GoVerified className="accent-text" />}
                {copyUserErr.mailError === 2 && <AiOutlineLoading3Quarters className="animate-spin accent-text" />}
                {copyUserErr.mailError === 3 && <FcCancel />}
              </label>
              <input 
                type="text" 
                disabled={!changeMode} 
                name="email" 
                id="email" 
                value={copyUser.email} 
                onChange={handleChange}
                className="w-full h-9 glass-card px-3 text-sm text-[var(--c-text-primary)] rounded-xl outline-none border border-white/10 disabled:opacity-75 focus:border-[var(--c-accent)] transition" 
              />
            </div>
          </div>

          {/* Theme Selector Section (Interactive Theme Gallery) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaPalette className="accent-text" size={18} />
                <h3 className="text-base font-bold text-[var(--c-text-primary)]">Theme Gallery</h3>
              </div>
              <span className="text-xs text-[var(--c-text-muted)]">Click any preset to instantly apply theme</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {themes.map((t) => {
                const isActive = theme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => changeThemeApi(t.id as ThemePreset)}
                    className={`glass-card p-3 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col gap-2 relative overflow-hidden ${
                      isActive 
                        ? 'border-[var(--c-accent)] shadow-xl ring-2 ring-[var(--c-accent)]/30 scale-[1.02]' 
                        : 'border-white/10 hover:border-white/20 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Mock Chat Preview */}
                    <div 
                      className="w-full h-20 rounded-xl p-2 flex flex-col justify-between overflow-hidden shadow-inner border border-white/10"
                      style={{ background: t.bgGradient }}
                    >
                      <div className="flex items-center justify-between text-[9px] font-bold text-white/80 border-b border-white/10 pb-1">
                        <span>{t.name}</span>
                        <span className="w-2 h-2 rounded-full" style={{ background: t.primaryColor }}></span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-3/4 h-3.5 rounded-lg p-1 text-[8px] flex items-center text-white/90 bg-white/10 border border-white/10">
                          Hi there! 👋
                        </div>
                        <div 
                          className="w-3/4 h-3.5 rounded-lg p-1 text-[8px] flex items-center text-black font-bold ml-auto"
                          style={{ background: t.primaryColor }}
                        >
                          Nice theme! ✨
                        </div>
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <div className="text-xs font-bold text-[var(--c-text-primary)]">{t.name}</div>
                        <div className="text-[10px] text-[var(--c-text-muted)] capitalize">{t.category} Theme</div>
                      </div>
                      {isActive ? (
                        <span className="accent-bg text-black p-1 rounded-full text-xs font-bold shadow-md">
                          <FaCheck size={10} />
                        </span>
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: t.primaryColor }}></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Quiz Section */}
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="accent-text" size={18} />
              <h3 className="text-base font-bold text-[var(--c-text-primary)]">Security Quiz</h3>
            </div>

            {user.question ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--c-text-muted)]">Active Safety Question</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    disabled 
                    value={copyUser.question} 
                    className="flex-1 h-9 glass-card px-3 text-sm text-[var(--c-text-primary)] rounded-xl outline-none border border-white/10 disabled:opacity-75" 
                  />
                  <button 
                    onClick={() => setOpenAns(true)}
                    className="p-2.5 rounded-xl accent-bg text-black font-bold shadow-md hover:brightness-110 transition cursor-pointer"
                    title="Reveal Answer"
                  >
                    <FaRegEye size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--c-text-muted)] flex items-center gap-1.5">
                    <span>Safety Question</span>
                    <FaCircleInfo size={12} title="Security questions help recover account credentials" />
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Favorite cricketer?" 
                    value={quiz.question} 
                    onChange={(e) => setQuiz({ ...quiz, question: e.target.value })} 
                    className="mt-1 w-full h-9 glass-card px-3 text-sm text-[var(--c-text-primary)] rounded-xl outline-none border border-white/10 focus:border-[var(--c-accent)] transition" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--c-text-muted)] flex items-center gap-1.5">
                    <span>Secret Answer</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Your answer..." 
                    value={quiz.ans} 
                    onChange={(e) => setQuiz({ ...quiz, ans: e.target.value })} 
                    className="mt-1 w-full h-9 glass-card px-3 text-sm text-[var(--c-text-primary)] rounded-xl outline-none border border-white/10 focus:border-[var(--c-accent)] transition" 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={submitQuiz} 
                  className="px-5 py-2 accent-bg text-black font-bold text-xs rounded-xl shadow-md hover:brightness-110 transition cursor-pointer"
                >
                  Submit Question
                </button>
              </div>
            )}
          </div>
        </section>
      </section>
    </>
  )
}

export default Settings