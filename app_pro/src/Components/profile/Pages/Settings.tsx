import { NavLink } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import x from "../../../assets/no_dp.png"
import { FaAngleLeft, FaRegEye } from "react-icons/fa"
import { HiLocationMarker } from "react-icons/hi"
import { useEffect, useRef, useState, type SetStateAction } from "react"
import { setSecourityAnswer, setSecourityQuestion, setTheme, updateEmail, updateName, updateSearchTag, type userType } from "../../../app/functions/auth"
import { GoVerified } from "react-icons/go"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { FcCancel } from "react-icons/fc"
import { BiColor } from "react-icons/bi"
import { DiSqllite } from "react-icons/di"
import { MdOutlineDarkMode } from "react-icons/md"
import { FaCircleInfo } from "react-icons/fa6"
import axios from "axios"
import { SampleCropper } from "../../Cropper/Cropper"

const api = import.meta.env.VITE_API;

interface copyUserInterface {
  tagError: number; // 1 -> verified, 2 -> process, 3 -> error
  mailError: number;
}

const AnsModel = ({ open, setOpen }: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const ans = useAppSelector((state) => state.auth.user.answer)
  return (
    <section onClick={() => setOpen(false)} className={`absolute ${open ? 'flex' : 'hidden'} items-center justify-center z-50 top-0 h-full w-full bg-[#365eae7d]`}>
      <div className="w-[20rem] h-[10rem] justify-center items-center flex flex-col bg-slate-800 gap-2 rounded-md">
        <h3 className="text-xl font-bold font-mono">Don't Share With Anyone!</h3>
        <p className="text-xl font-medium text-green-400">{ans}</p>
      </div>
    </section>
  )
}

const VerifyModel = ({ open, setOpen }: {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
  const [password, setPassword] = useState<string>("")
  // const isVerified = useAppSelector((state) => state.auth.user.isVerified)
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
    <section className={`absolute ${open ? 'flex' : 'hidden'} items-center justify-center z-50 top-0 h-full w-full bg-[#365eae7d]`}>
      <div className="w-[20rem] h-[14rem] justify-center items-center flex flex-col bg-slate-800 gap-2.5 rounded-md">
        <h3 className="text-xl font-bold font-mono">Verify it's You!</h3>
        <p className="text-xl font-medium text-green-400">Enter your Password!</p>
        <input type="text" className="h-[1.6rem] bg-slate-500 text-white rounded-md pl-1" placeholder="enter your password" onChange={(e) => setPassword(e.target.value)} />
        <button onClick={submit} className="w-[4rem] h-[1.6rem] bg-green-500 rounded-md cursor-pointer">Verify</button>
        <button onClick={() => setOpen(false)} className="w-[4rem] h-[1.6rem] bg-red-500 rounded-md cursor-pointer">close</button>
      </div>
    </section>
  )
}

const Settings = () => {
  const disp = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const verifed = useAppSelector((state) => state.auth.user.isVerified)
  const dpRef = useRef<HTMLInputElement | null>(null)

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

  async function changeTheme() {
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
  }, [tempAvatar, setTempAvatar, openEditor, setOpenAns])

  return (
    <>
      <SampleCropper open={openEditor} setOpen={setOpenEditor} image={tempAvatar} setImage={setTempAvatar} />
      <AnsModel setOpen={setOpenAns} open={openAns && verifed} />
      <VerifyModel setOpen={setOpenAns} open={openAns && !verifed} />

      <section className="w-full min-h-[100vh] overflow-y-auto flex justify-center rounded-sm">
        <section className="w-[90%] h-[98%] flex flex-col items-center gap-2 md:w-[98%]">
          <div className="w-full lg:w-[80%] h-full min-h-[98vh] grid grid-cols-[0.3fr_9.7fr] pt-3 mt-1 pb-4 bg-slate-800 rounded-[9px_9px_0_0]">
            <div className="pt-2 pl-1"><NavLink to={'/user'} ><FaAngleLeft size={20} /></NavLink></div>
            <div className="w-full flex flex-col justify-center items-center gap-3">
              <div className="w-full flex flex-col justify-center items-center gap-3 lg:grid lg:grid-cols-2">
                <div className="w-full h-auto flex flex-col gap-1 justify-center items-center">
                  <div className="bg-inherit w-[10rem] h-[10rem] rounded-[50%] overflow-hidden sha">
                    <img src={user.avatar || x} onClick={avatarClick} alt="profile picture" className="cursor-pointer w-full h-auto" />
                    <input ref={dpRef} onChange={(e) => handleAvatar(e)} type="file" accept='image' name="db" id="" />
                  </div>
                  <div className="w-full flex flex-col gap-0.5 items-center justify-center">
                    <p className="text-[22px] font-bold">{user.userName}</p>
                    <div className="flex items-center justify-center gap-1 text-sm"><HiLocationMarker color="#c8bfbf" />NY, New Yourk City</div>
                  </div>
                </div>
                <div className="flex flex-col w-[90%] items-center justify-center gap-4 border-t-2 border-gray-400 pt-2">
                  <div className="w-[95%] flex justify-between items-center gap-0.5 ">
                    <div className=""></div>
                    <div className="flex flex-row-reverse gap-2">
                      {
                        changeMode ? (
                          <>
                            <button onClick={() => handelCancel()} className="cursor-pointer bg-sky-500 w-[3.5rem] rounded-md hover:bg-sky-600">Close</button>
                            <button disabled={
                              copyUser.searchTag.length <= 2 ||
                              copyUser.email.length <= 2 ||
                              copyUser.userName.length < 3
                            } onClick={save} className="cursor-pointer bg-pink-500 w-[3.5rem] rounded-md hover:bg-pink-600 disabled:bg-pink-800">Save</button>
                          </>
                        ) : (
                          <button onClick={() => setChangeMode(true)} className="cursor-pointer bg-pink-500 w-[3.5rem] rounded-md hover:bg-pink-600">Edit</button>
                        )
                      }
                    </div>
                  </div>
                  <div className="w-[70%] flex flex-col gap-0.5 ">
                    <label htmlFor="searchTag" className="text-sm font-bold pl-1">Search Tag</label>
                    <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                      <input type="text" disabled={!changeMode} name="searchTag" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="searchTag" value={copyUser.searchTag} onChange={handleChange} />
                      {
                        copyUserErr.tagError === 1 ? (<GoVerified color="#a363d2" title="verified" />) :
                          (
                            copyUserErr.tagError === 2 ? (<AiOutlineLoading3Quarters className="animate-spin" color="#a363d2" title="loading.." />) :
                              (
                                copyUserErr.tagError === 3 ? (<FcCancel color="#a363d2" title="already taken" />) : null
                              )
                          )
                      }

                    </div>
                  </div>
                  <div className="w-[70%] flex flex-col gap-0.5 ">
                    <label htmlFor="userName" className="text-sm font-bold pl-1">Name</label>
                    <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1">
                      <input type="text" disabled={!changeMode} name="userName" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="name" value={copyUser.userName} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="w-[70%] flex flex-col gap-0.5 ">
                    <label htmlFor="email" className="text-sm font-bold pl-1">Email</label>
                    <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1">
                      <input type="text" disabled={!changeMode} name="email" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="name" value={copyUser.email} onChange={handleChange} />
                      {
                        copyUserErr.mailError === 1 ? (<GoVerified color="#a363d2" />) :
                          (
                            copyUserErr.mailError === 2 ? (<AiOutlineLoading3Quarters className="animate-spin" color="#a363d2" />) :
                              (
                                copyUserErr.mailError === 3 ? (<FcCancel color="#a363d2" />) : null
                              )
                          )
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full flex flex-col justify-center items-center gap-3 lg:hidden lg:grid-cols-2 ">
                <div className="flex flex-col w-[90%] items-center justify-center gap-4 border-t-2 border-gray-400 pt-2">
                  <div className="w-[70%] flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg">Theme <BiColor size={20} /></div>
                    <div className="">
                      <div className={`w-[3rem] ${!user.theme ? 'bg-slate-950' : 'bg-white'} rounded-2xl overflow-hidden`}>
                        <div onClick={() => changeTheme()} className={`w-[80%] ${user.theme ? 'bg-slate-950' : 'bg-white'} flex items-center justify-center rounded-2xl ${user.theme ? "translate-x-0" : "translate-x-4"}`}>
                          {
                            user.theme ? (
                              <MdOutlineDarkMode size={25} />
                            ) : (
                              <DiSqllite color="black" size={25} />
                            )
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col w-[90%] items-center justify-center gap-4 border-t-2 border-gray-400 pt-2">
                  <div className="">
                    <h4 className="text-xl font-bold font-mono">Secourity Quiz</h4>
                  </div>
                  {
                    user.question ? (
                      <div className="w-[70%] flex flex-col gap-0.5 ">
                        <label htmlFor="question" className="text-sm font-bold pl-1">Safety Question</label>
                        <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                          <input type="text" disabled={true} name="question" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" value={copyUser.question} />
                          <FaRegEye size={20} cursor={"pointer"} onClick={() => setOpenAns(true)} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-[70%] flex flex-col gap-0.5 ">
                          <label htmlFor="question" className="text-sm font-bold pl-1 flex items-center gap-2">Add Safety Question <FaCircleInfo size={10} title="secoutiy question will help you in case you forgot your password!" /> </label>
                          <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                            <input type="text" name="question" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" placeholder="hind: favrouit cricketer?" value={quiz.question} onChange={(e) => setQuiz({ ...quiz, question: e.target.value })} />
                          </div>
                        </div>
                        <div className="w-[70%] flex flex-col gap-0.5 ">
                          <label htmlFor="question" className="text-sm font-bold pl-1 flex items-center gap-2">Answer <FaCircleInfo size={10} title="secoutiy question will help you in case you forgot your password!" /> </label>
                          <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                            <input type="text" name="ans" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" placeholder="hind: Your Answer?" value={quiz.ans} onChange={(e) => setQuiz({ ...quiz, ans: e.target.value })} />
                          </div>
                        </div>
                        <div className="w-[70%] flex flex-col gap-0.5 items-center">
                          <button type="button" onClick={submitQuiz} className="w-[5rem] rounded-md cursor-pointer hover:bg-green-600 bg-green-500">SUBMIT</button>
                        </div>
                      </>
                    )
                  }

                </div>
              </div>
              <div className="w-full hidden flex-col justify-center items-center gap-3 lg:grid lg:grid-cols-2 ">
                <div className="flex flex-col w-[90%] items-center justify-center gap-4 border-t-2 border-gray-400 pt-2">
                  <div className="">
                    <h4 className="text-xl font-bold font-mono">Secourity Quiz</h4>
                  </div>
                  {
                    user.question ? (
                      <div className="w-[70%] flex flex-col gap-0.5 ">
                        <label htmlFor="question" className="text-sm font-bold pl-1">Safety Question</label>
                        <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                          <input type="text" disabled={true} name="question" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" value={copyUser.question} />
                          <FaRegEye size={20} cursor={"pointer"} onClick={() => setOpenAns(true)} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-[70%] flex flex-col gap-0.5 ">
                          <label htmlFor="question" className="text-sm font-bold pl-1 flex items-center gap-2">Add Safety Question <FaCircleInfo size={10} title="secoutiy question will help you in case you forgot your password!" /> </label>
                          <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                            <input type="text" name="question" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" placeholder="hind: favrouit cricketer?" value={quiz.question} onChange={(e) => setQuiz({ ...quiz, question: e.target.value })} />
                          </div>
                        </div>
                        <div className="w-[70%] flex flex-col gap-0.5 ">
                          <label htmlFor="question" className="text-sm font-bold pl-1 flex items-center gap-2">Answer <FaCircleInfo size={10} title="secoutiy question will help you in case you forgot your password!" /> </label>
                          <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                            <input type="text" name="ans" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" placeholder="hind: Your Answer?" value={quiz.ans} onChange={(e) => setQuiz({ ...quiz, ans: e.target.value })} />
                          </div>
                        </div>
                        <div className="w-[70%] flex flex-col gap-0.5 items-center">
                          <button type="button" onClick={submitQuiz} className="w-[5rem] rounded-md cursor-pointer hover:bg-green-600 bg-green-500">SUBMIT</button>
                        </div>
                      </>
                    )
                  }

                </div>
                <div className="flex flex-col w-[90%] items-center justify-center gap-4 border-t-2 border-gray-400 pt-2">
                  <div className="w-[70%] flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg">Theme <BiColor size={20} /></div>
                    <div className="">
                      <div className={`w-[3rem] ${!user.theme ? 'bg-slate-950' : 'bg-white'} rounded-2xl overflow-hidden`}>
                        <div onClick={() => changeTheme()} className={`w-[80%] ${user.theme ? 'bg-slate-950' : 'bg-white'} flex items-center justify-center rounded-2xl ${user.theme ? "translate-x-0" : "translate-x-4"}`}>
                          {
                            user.theme ? (
                              <MdOutlineDarkMode size={25} />
                            ) : (
                              <DiSqllite color="black" size={25} />
                            )
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </>
  )
}

export default Settings