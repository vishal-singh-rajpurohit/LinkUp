import { CiMenuKebab } from "react-icons/ci"
import g from '../../assets/no_dp.png'
import { useEffect, useRef, useState } from "react"
import { removeTempMessage, setTempString } from "../../app/functions/temp";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import axios from "axios";
import { removeMessage } from "../../app/functions/auth";
import { getTimeDifference } from "../../helpers/timeConverter";

const api = import.meta.env.VITE_API;


export const Mail = (
  {
    mailOptions,
    avatar,
    message,
    _id,
    senderTag,
    time = null
  }: {
    mailOptions: React.RefObject<HTMLDivElement | null>;
    message: string;
    _id: string;
    avatar: string;
    senderTag: string;
    time: Date | null
  }) => {
  const disp = useAppDispatch()
  const currMessageRef = useRef<HTMLDivElement | null>(null)
  const [timer, setTimer] = useState<string>("")

  useEffect(() => {
    if (time) {
      const currTime: string = getTimeDifference(time)
      setTimer(currTime)
    }
  }, [time])

  useEffect(() => {
    disp(setTempString({ text: _id }))
    const currMessageEl = currMessageRef.current;

    if (currMessageEl) {
      const handleClick = (e: MouseEvent) => {
        if (mailOptions.current) {
          mailOptions.current.style.display = 'flex'
          mailOptions.current.style.top = `${e.clientY}px`
          mailOptions.current.style.left = `${e.clientX}px`
          mailOptions.current.addEventListener('mouseleave', () => {
            if (mailOptions.current) mailOptions.current.style.display = 'none';
          })
        }
      };

      currMessageEl.addEventListener('click', handleClick);
      return () => {
        currMessageEl.removeEventListener('click', handleClick);
      };
    }
  }, []);

  // for sent messaes => bg-[#00F0FF] text-[#0F172A]
  return (
    <div className={`flex gap-2 text-white`}>
      <div className="">
        <div className='w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
          <img src={avatar || g} alt="😒" className="max-h-[1.5rem] h-full" />
        </div>
      </div>
      <div className="min-h-7 max-w-[80%]">
        <div className="bg-[#334155] text-[#F8FAFC] p-1 rounded-md "><div className="text-[10px]">{senderTag}</div>{message}</div>
        <div className="text-[10px]">
          <div>{timer}</div>
        </div>
      </div>
      <div ref={currMessageRef} className="flex"><CiMenuKebab cursor={'pointer'} className="current-message" /></div>
    </div>
  )
}

export const MailMe = (
  {
    mailOptions,
    avatar,
    message,
    _id,
    senderTag,
    time = null
  }: {
    mailOptions: React.RefObject<HTMLDivElement | null>;
    message?: string;
    _id: string;
    avatar?: string;
    senderTag?: string;
    time: Date | null;
  }) => {
  const disp = useAppDispatch()
  const currMessageRef = useRef<HTMLDivElement | null>(null);
  const [timer, setTimer] = useState<string>("")

  useEffect(() => {
    if (time) {
      const currTime: string = getTimeDifference(time)
      setTimer(currTime)
    }
  }, [time])

  useEffect(() => {
    disp(setTempString({ text: _id }))
    const currMessageEl = currMessageRef.current;


    if (currMessageEl) {
      const handleClick = (e: MouseEvent) => {
        if (mailOptions.current) {
          mailOptions.current.style.display = 'flex'
          mailOptions.current.style.top = `${e.clientY}px`
          mailOptions.current.style.left = `${e.clientX}px`
          mailOptions.current.addEventListener('mouseleave', () => {
            if (mailOptions.current) mailOptions.current.style.display = 'none';
          })
        }
      };

      currMessageEl.addEventListener('click', handleClick);
      return () => {
        currMessageEl.removeEventListener('click', handleClick);
      };
    }
  }, []);

  return (
    <div className={`flex gap-2 text-white flex-row-reverse `}>
      <div className="">
        <div className='w-[1.r3em] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
          <img src={avatar || g} alt="😒" className="max-h-[1.5rem] h-full" />
        </div>
      </div>
      <div className="min-h-6 max-w-[80%] ">
        <div className="bg-[#00F0FF] text-[#0F172A] p-1 rounded-md ">
          <div className="text-[10px] flex flex-row-reverse">{senderTag}</div>
          <div className="">
            {message}
          </div>
        </div>
        <div className="text-[10px]">
          <div>{timer}</div>
        </div>
      </div>
      <div ref={currMessageRef} className="flex"><CiMenuKebab cursor={'pointer'} className="current-message" /></div>
    </div>
  )
}




export const MailMenu = ({ mailRef }: { mailRef: React.RefObject<HTMLDivElement | null> }) => {
  const disp = useAppDispatch()
  const messageId = useAppSelector((state) => state.temp.tempString)
  const contact = useAppSelector((state) => state.temp.selectedContact)
  const user = useAppSelector((state) => state.auth.user)
  const chatType = useAppSelector((state) => state.temp.chatListTypes)

  async function undoMessage() {
    try {
      const resp = await axios.post<{
        data: {
          removedId: string;
        }
      }>(`${api}/chat/message/del-msg`, {
        messageId,
        contactId: user._id
      }, { withCredentials: true });

      disp(setTempString({ text: "" }));
      disp(removeMessage({ contactId: contact._id, messageId: resp.data.data.removedId, trigger: chatType }))
      disp(removeTempMessage({ messageId: resp.data.data.removedId }))

      if (mailRef.current) mailRef.current.style.display = "none"

    } catch (error) {
      disp(setTempString({ text: "" }));
      console.log(`error in undo message: ${error}`);
    }
  }

  return (
    // <section className="fixed flex items-center justify-center w-full">
    <section ref={mailRef} id="message-options" className="absolute hidden flex-col items-center justify-center gap-1 px-2 rounded-sm max-w-max h-[4.5rem] text-[12px] text-blue-100 bg-slate-700">
      <div className="cursor-pointer">forward to</div>
      <div onClick={undoMessage} className="cursor-pointer">undo message</div>
      <div className="cursor-pointer">reply to message</div>
      {/* <div className="cursor-pointer">cancel</div> */}
    </section>
  )
}