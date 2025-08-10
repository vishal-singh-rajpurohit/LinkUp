import { NavLink } from "react-router-dom"
import { useAppSelector } from "../../../app/hooks"
import x from "../../../assets/no_dp.png"
import { FaAngleLeft, FaRegEye, FaThemeco } from "react-icons/fa"
import { HiLocationMarker } from "react-icons/hi"
import { useEffect, useState, type SetStateAction } from "react"
import type { userType } from "../../../app/functions/auth"
import { TiTick } from "react-icons/ti"
import { GoVerified } from "react-icons/go"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { FcCancel } from "react-icons/fc"
import { BiColor } from "react-icons/bi"
import { DiSqllite } from "react-icons/di"
import { MdOutlineDarkMode } from "react-icons/md"
import { FaCircleInfo } from "react-icons/fa6"


interface copyUserInterface extends userType {
  tagError: number; // 1 -> verified, 2 -> process, 3 -> error
  mailError: number;
}

const AnsModel = ({ ans, open, setOpen }: {
  ans: string;
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <section onClick={()=>setOpen(false)} className={`absolute ${open?'flex': 'hidden'} items-center justify-center z-50 top-0 h-full w-full bg-[#365eae7d]`}>
      <div className="w-[20rem] h-[10rem] justify-center items-center flex flex-col bg-slate-800 gap-2 rounded-md">
        <h3 className="text-xl font-bold font-mono">Don't Share With Anyone!</h3>
        <p className="text-xl font-medium text-green-400">{ans}</p>
      </div>
    </section>
  )
}

const Settings = () => {
  const user = useAppSelector((state) => state.auth.user)

  const [changeMode, setChangeMode] = useState<boolean>()
  const [copyUser, setCopyUser] = useState<copyUserInterface>(
    {
      _id: "",
      avatar: "",
      userName: "",
      email: "",
      searchTag: "",
      socketId: "",
      theme: false,
      mailError: 1,
      tagError: 1,
    },
  )

  const [verifed, setVerified] = useState<boolean>(false);
  const [openAns, setOpenAns] = useState<boolean>(false)

  const [quiz, setQuiz] = useState<{
    question: string;
    ans: string;
  }>({
    ans: "",
    question: ""
  })


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCopyUser({ ...copyUser, [e.target.name]: e.target.value })
  }

  function changeTheme() {
    setCopyUser({
      ...copyUser,
      theme: !copyUser.theme
    })
  }

  useEffect(() => {
    setCopyUser({ ...user, mailError: 1, tagError: 1 })
  }, [user])

  return (
    <>
      <AnsModel setOpen={setOpenAns} open={openAns && verifed} ans={quiz.ans} />

      <section className="w-full min-h-[100vh] overflow-y-auto flex justify-center rounded-sm">
        <section className="w-[90%] h-[98%] flex flex-col items-center gap-2 md:w-[98%]">
          <div className="w-full lg:w-[80%] h-full min-h-[98vh] grid grid-cols-[0.3fr_9.7fr] pt-3 mt-1 pb-4 bg-slate-800 rounded-[9px_9px_0_0]">
            <div className="pt-2 pl-1"><NavLink to={'/user'} ><FaAngleLeft size={20} /></NavLink></div>
            <div className="w-full flex flex-col justify-center items-center gap-3">
              <div className="w-full flex flex-col justify-center items-center gap-3 lg:grid lg:grid-cols-2">
                <div className="w-full h-auto flex flex-col gap-1 justify-center items-center">
                  <div className="bg-inherit w-[10rem] h-[10rem] rounded-[50%] overflow-hidden sha">
                    <img src={user.avatar || x} alt="profile picture" className="w-full h-auto" />
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
                            <button onClick={() => setChangeMode(false)} className="cursor-pointer bg-sky-500 w-[3.5rem] rounded-md hover:bg-sky-600">Close</button>
                            <button className="cursor-pointer bg-pink-500 w-[3.5rem] rounded-md hover:bg-pink-600">Save</button>
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
                      <input type="text" disabled={!changeMode} name="searchTag" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="name" value={copyUser.userName} onChange={handleChange} />
                      {
                        copyUser.tagError === 1 ? (<GoVerified color="#a363d2" title="verified" />) :
                          (
                            copyUser.tagError === 2 ? (<AiOutlineLoading3Quarters className="animate-spin" color="#a363d2" title="loading.." />) :
                              (
                                copyUser.tagError === 3 ? (<FcCancel color="#a363d2" title="already taken" />) : null
                              )
                          )
                      }

                    </div>
                  </div>
                  <div className="w-[70%] flex flex-col gap-0.5 ">
                    <label htmlFor="name" className="text-sm font-bold pl-1">Name</label>
                    <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1">
                      <input type="text" disabled={!changeMode} name="userName" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="name" value={copyUser.userName} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="w-[70%] flex flex-col gap-0.5 ">
                    <label htmlFor="email" className="text-sm font-bold pl-1">Email</label>
                    <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1">
                      <input type="text" disabled={!changeMode} name="email" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="name" value={copyUser.userName} onChange={handleChange} />
                      {
                        copyUser.mailError === 1 ? (<GoVerified color="#a363d2" />) :
                          (
                            copyUser.mailError === 2 ? (<AiOutlineLoading3Quarters className="animate-spin" color="#a363d2" />) :
                              (
                                copyUser.mailError === 3 ? (<FcCancel color="#a363d2" />) : null
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
                      <div className={`w-[3rem] ${!copyUser.theme ? 'bg-slate-950' : 'bg-white'} rounded-2xl overflow-hidden`}>
                        <div onClick={() => changeTheme()} className={`w-[80%] ${copyUser.theme ? 'bg-slate-950' : 'bg-white'} flex items-center justify-center rounded-2xl ${copyUser.theme ? "translate-x-0" : "translate-x-4"}`}>
                          {
                            copyUser.theme ? (
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
                    quiz.question ? (
                      <div className="w-[70%] flex flex-col gap-0.5 ">
                        <label htmlFor="question" className="text-sm font-bold pl-1">Safety Question</label>
                        <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                          <input type="text" disabled={!changeMode} name="question" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" value={quiz.question} onChange={handleChange} />
                          <FaRegEye size={20} cursor={"pointer"} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-[70%] flex flex-col gap-0.5 ">
                          <label htmlFor="question" className="text-sm font-bold pl-1 flex items-center gap-2">Add Safety Question <FaCircleInfo size={10} title="secoutiy question will help you in case you forgot your password!" /> </label>
                          <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                            <input type="text" disabled={!changeMode} name="question" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" placeholder="hind: favrouit cricketer?" value={quiz.question} onChange={handleChange} />
                          </div>
                        </div>
                        <div className="w-[70%] flex flex-col gap-0.5 ">
                          <label htmlFor="question" className="text-sm font-bold pl-1 flex items-center gap-2">Answer <FaCircleInfo size={10} title="secoutiy question will help you in case you forgot your password!" /> </label>
                          <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                            <input type="text" disabled={!changeMode} name="question" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" placeholder="hind: Your Answer?" value={quiz.question} onChange={handleChange} />
                          </div>
                        </div>
                        <div className="w-[70%] flex flex-col gap-0.5 items-center">
                          <button className="w-[5rem] rounded-md cursor-pointer hover:bg-green-600 bg-green-500">SUBMIT</button>
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
                    quiz.question ? (
                      <div className="w-[70%] flex flex-col gap-0.5 ">
                        <label htmlFor="question" className="text-sm font-bold pl-1">Safety Question</label>
                        <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                          <input type="text" disabled={!changeMode} name="question" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" value={quiz.question} onChange={handleChange} />
                          <FaRegEye size={20} cursor={"pointer"} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-[70%] flex flex-col gap-0.5 ">
                          <label htmlFor="question" className="text-sm font-bold pl-1 flex items-center gap-2">Add Safety Question <FaCircleInfo size={10} title="secoutiy question will help you in case you forgot your password!" /> </label>
                          <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                            <input type="text" disabled={!changeMode} name="question" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" placeholder="hind: favrouit cricketer?" value={quiz.question} onChange={handleChange} />
                          </div>
                        </div>
                        <div className="w-[70%] flex flex-col gap-0.5 ">
                          <label htmlFor="question" className="text-sm font-bold pl-1 flex items-center gap-2">Answer <FaCircleInfo size={10} title="secoutiy question will help you in case you forgot your password!" /> </label>
                          <div className="w-full grid grid-cols-[9.5fr_1fr] gap-1 justify-center">
                            <input type="text" disabled={!changeMode} name="question" className="w-[100%] h-[1.5rem] bg-slate-500 pl-1 text-sm rounded-[5px] outline-0" id="question" placeholder="hind: Your Answer?" value={quiz.question} onChange={handleChange} />
                          </div>
                        </div>
                        <div className="w-[70%] flex flex-col gap-0.5 items-center">
                          <button className="w-[5rem] rounded-md cursor-pointer hover:bg-green-600 bg-green-500">SUBMIT</button>
                        </div>
                      </>
                    )
                  }

                </div>
                <div className="flex flex-col w-[90%] items-center justify-center gap-4 border-t-2 border-gray-400 pt-2">
                  <div className="w-[70%] flex items-center justify-between">
                    <div className="flex items-center gap-1 text-lg">Theme <BiColor size={20} /></div>
                    <div className="">
                      <div className={`w-[3rem] ${!copyUser.theme ? 'bg-slate-950' : 'bg-white'} rounded-2xl overflow-hidden`}>
                        <div onClick={() => changeTheme()} className={`w-[80%] ${copyUser.theme ? 'bg-slate-950' : 'bg-white'} flex items-center justify-center rounded-2xl ${copyUser.theme ? "translate-x-0" : "translate-x-4"}`}>
                          {
                            copyUser.theme ? (
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