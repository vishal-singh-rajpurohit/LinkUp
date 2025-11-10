import { CiMenuKebab } from "react-icons/ci"
import g from '../../assets/no_dp.png'
import React, { useContext, useEffect, useRef, useState } from "react"
import { notificationPup, setHasAttechments, setTempString, triggetUploadType } from "../../app/functions/temp";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import axios from "axios";
import { getTimeDifference } from "../../helpers/timeConverter";
import { FcDown } from "react-icons/fc";
import { AppContext, WSContext } from "../../context/Contexts";
import { ChatEventsEnum } from "../../context/constant";
import { FaFile, FaImage, FaVideo, FaDownload, FaTimes, FaFileImage, FaFileVideo, FaFileAudio, FaFileCode, FaFileAlt, } from "react-icons/fa";
import { IoMdCloudUpload } from "react-icons/io"
import { RiCheckDoubleLine } from "react-icons/ri";
import sound from '../../assets/sound.mp3'

const api = import.meta.env.VITE_API;

export const Mail = (
  {
    mailOptions,
    mailRef,
    avatar,
    readBy,
    message,
    _id,
    senderTag,
    time = null
  }: {
    mailOptions: React.RefObject<HTMLDivElement | null>;
    mailRef: React.RefObject<HTMLDivElement | null>;
    message: string;
    readBy: string[];
    _id: string;
    avatar: string;
    senderTag: string;
    time: Date | null
  }) => {
  const disp = useAppDispatch()
  const currMessageRef = useRef<HTMLDivElement | null>(null)
  const messageRef = useRef<HTMLDivElement | null>(null)
  const [timer, setTimer] = useState<string>("")
  const userId = useAppSelector((state) => state.auth.user._id)
  const socketContext = useContext(WSContext)
  const [wrapEnable, setWrapEnable] = useState<boolean>(false)
  useEffect(() => {
    if (message.length > 80) {
      setWrapEnable(true)
    }
  }, [])

  if (!socketContext) {
    throw new Error("socket context not found")
  }

  const { socket } = socketContext

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const msgIdx = readBy.indexOf(userId)

          if (msgIdx === -1) {
            socket?.emit(ChatEventsEnum.MARK_READ, ({
              id: userId,
              msgId: _id
            }))
          }

          // Stop observing to avoid multiple events
          if (messageRef.current) observer.unobserve(messageRef.current);

        }
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );

    if (messageRef.current) {
      observer.observe(messageRef.current);
    }

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, [message, socket]);

  // for sent messaes => bg-[#00F0FF] text-[#0F172A]
  return (
    <div id={_id} ref={messageRef} className={`flex gap-2 text-white`}>
      <div className="">
        <div className='w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-slate-600 md:h-[1.5rem] md:w-[1.5rem]'>
          <img src={avatar || g} alt="" className="max-h-[1.5rem] h-full" />
        </div>
      </div>
      <div className="the-msg min-h-5 max-w-[80%] min-w-[3rem] ">
        <div ref={mailRef} data-msgId={_id} data-tag={senderTag} className={`${wrapEnable && 'max-h-[8rem] overflow-hidden'} bg-[#334155] text-[#F8FAFC] p-1 rounded-md text-[12px]`}>
          <div className="text-[7px]">{senderTag}</div>
          {message}
        </div>
        <div className="text-[10px]">
          <div className={`underline font-bold cursor-pointer ${message.length > 80 ? 'flex' : 'hidden'}`} onClick={() => setWrapEnable(!wrapEnable)}>
            {
              wrapEnable ? 'show more' : 'show less'
            }
          </div>
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
    mailRef,
    readBy,
    avatar,
    message,
    _id,
    senderTag,
    time = null
  }: {
    mailOptions: React.RefObject<HTMLDivElement | null>;
    mailRef: React.RefObject<HTMLDivElement | null>;
    readBy: string[];
    message: string;
    _id: string;
    avatar?: string;
    senderTag?: string;
    time: Date | null;
  }) => {
  const disp = useAppDispatch()
  const currMessageRef = useRef<HTMLDivElement | null>(null);
  const [timer, setTimer] = useState<string>("")

  const [wrapEnable, setWrapEnable] = useState<boolean>(false)
  useEffect(() => {
    if (message.length > 80) {
      setWrapEnable(true)
    }
  }, [])

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
    <>
      <div id={_id} className={`flex gap-2 text-white flex-row-reverse selection:bg-[#fff0]`}>
        <div className="">
          <div className='w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-slate-600 md:h-[1.5rem] md:w-[1.5rem]'>
            <img src={avatar || g} alt="" className="max-h-[1.5rem] h-full" />
          </div>
        </div>
        <div className="the-msg min-h-4 max-w-[80%] min-w-[3rem] ">
          <div
            ref={mailRef} data-msgid={_id} data-tag={senderTag}
            className={` bg-[#00F0FF] ${wrapEnable && 'max-h-[8rem] overflow-hidden'} text-[#0F172A] p-1 rounded-md cursor-pointer text-[12px]`}>
            <div className="text-[7px] flex flex-row-reverse ">{senderTag}</div>
            <div className="text-[12px]">
              {message}
            </div>
            <div className="text-[10px] w-full flex items-end justify-end">
              {
                readBy.length ?
                  (<span className="text-[#e915e3]"><RiCheckDoubleLine /></span>) :
                  (<span className="text-[#1519d0]">✓</span>)
              }
            </div>
          </div>
          <div className="text-[10px]">
            <div className={`underline font-bold cursor-pointer ${message.length > 80 ? 'flex' : 'hidden'}`} onClick={() => setWrapEnable(!wrapEnable)}>
              {
                wrapEnable ? 'show more' : 'show less'
              }
            </div>
            <div>{timer}</div>
          </div>
        </div>
        <div ref={currMessageRef} className="flex"><CiMenuKebab cursor={'pointer'} className="current-message" /></div>
      </div>
    </>
  )
}

export const MailAttechmentMe = (
  {
    mailOptions,
    mailRef,
    readBy,
    avatar,
    message,
    _id,
    senderTag,
    time = null,
    attechmentLink = ""
  }: {
    mailOptions: React.RefObject<HTMLDivElement | null>;
    mailRef: React.RefObject<HTMLDivElement | null>;
    readBy: string[];
    message: string;
    _id: string;
    avatar?: string;
    senderTag?: string;
    time: Date | null;
    attechmentLink?: string
  }
) => {
  const disp = useAppDispatch()
  const currMessageRef = useRef<HTMLDivElement | null>(null);
  const [timer, setTimer] = useState<string>("")
  const [wrapEnable, setWrapEnable] = useState<boolean>(false)
  useEffect(() => {
    if (message.length > 80) {
      setWrapEnable(true)
    }
  }, [])

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
    <div className="flex flex-col items-end gap-2 text-white selection:bg-[#fff0]">
      {
        attechmentLink !== "" && (
          <div className="flex gap-2 text-white flex-row-reverse selection:bg-[#fff0]">
            <div className="w-[1.3rem] h-[1.3rem]"></div>
            <div className="bg-[#29927b] px-2 selection:hidden w-[5rem] text-white h-7 rounded-e-md rounded-b-md rounded-t-md gap-3 flex items-center justify-between">
              <div className="">
                <DownloadWithProgress url={attechmentLink} />
              </div>
            </div>
            <div className=""></div>
          </div>
        )
      }
      <div id={_id} className={`flex gap-2 text-white flex-row-reverse selection:bg-[#fff0]`}>
        <div className="">
          <div className='w-[1.r3em] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
            <img src={avatar || g} alt="😒" className="max-h-[1.5rem] h-full" />
          </div>
        </div>
        <div className="min-h-6 max-w-[80%] min-w-[3rem] ">
          <div ref={mailRef} data-msgid={_id} data-tag={senderTag} className={`bg-[#00F0FF] ${wrapEnable && 'max-h-[8rem] overflow-hidden'} text-[#0F172A] p-0.5 rounded-md cursor-pointer`}>
            <div className="text-[7px] flex flex-row-reverse">{senderTag}</div>
            <div className="text-[12px]">
              {message}
            </div>
            <div className="text-[10px] w-full flex items-end justify-end">
              {
                readBy.length ?
                  (<span className="text-[#e915e3]"><RiCheckDoubleLine /></span>) :
                  (<span className="text-[#1519d0]">✓</span>)
              }
            </div>
          </div>
          <div className="text-[10px]">
            <div className={`underline font-bold cursor-pointer ${message.length > 80 ? 'flex' : 'hidden'}`} onClick={() => setWrapEnable(!wrapEnable)}>
              {
                wrapEnable ? 'show more' : 'show less'
              }
            </div>
            <div>{timer}</div>
          </div>
        </div>
        <div ref={currMessageRef} className="flex"><CiMenuKebab cursor={'pointer'} className="current-message" /></div>
      </div>
    </div>
  )
}

export const MailAttechment = (
  {
    mailOptions,
    mailRef,
    avatar,
    message,
    _id,
    senderTag,
    time = null,
    attechmentLink = ""
  }: {
    mailOptions: React.RefObject<HTMLDivElement | null>;
    mailRef: React.RefObject<HTMLDivElement | null>;

    message: string;
    readBy: string[];
    _id: string;
    avatar: string;
    senderTag: string;
    time: Date | null;
    fileType: string | null;
    attechmentLink: string;
  }
) => {

  const disp = useAppDispatch()
  const currMessageRef = useRef<HTMLDivElement | null>(null);
  const messageRef = useRef<HTMLDivElement | null>(null)

  const [wrapEnable, setWrapEnable] = useState<boolean>(false)
  useEffect(() => {
    if (message.length > 80) {
      setWrapEnable(true)
    }
  }, [])

  const [timer, setTimer] = useState<string>("")
  useEffect(() => {
    if (message.length > 80) {
      setWrapEnable(true)
    }
  }, [])

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
    <div className="flex flex-col gap-2 text-white selection:bg-[#fff0]">
      {
        attechmentLink !== "" && (
          <div className="flex gap-2 text-white selection:bg-[#fff0]">
            <div className="w-[1.3rem] h-[1rem]"></div>
            <div className="bg-[#2a4263] px-2 selection:hidden w-[rem] text-white h-7 rounded-e-md rounded-b-md rounded-t-md gap-3 flex items-center justify-between">
              <div className="">
                <DownloadWithProgress url={attechmentLink} />
              </div>
            </div>
            <div className=""></div>
          </div>
        )
      }
      <div id={_id} ref={messageRef} className={`flex gap-1 text-white`}>
        <div className="">
          <div className='w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
            <img src={avatar || g} alt="😒" className="max-h-[1.5rem] h-full" />
          </div>
        </div>
        <div className="the-msg min-h-7 max-w-[80%] min-w-[3rem] ">
          <div ref={mailRef} data-msgId={_id} data-tag={senderTag} className={` bg-[#334155] ${wrapEnable && 'max-h-[8rem] overflow-hidden'} text-[#F8FAFC] p-1 rounded-md text-[12px]`}>
            <div className="text-[7px]">{senderTag}</div>
            {message}
          </div>
          <div className="text-[10px]">
            <div className={`underline font-bold cursor-pointer ${message.length > 80 ? 'flex' : 'hidden'}`} onClick={() => setWrapEnable(!wrapEnable)}>
              {
                wrapEnable ? 'show more' : 'show less'
              }
            </div>
            <div>{timer}</div>
          </div>
        </div>
        <div ref={currMessageRef} className="flex"><CiMenuKebab cursor={'pointer'} className="current-message" /></div>
      </div>
    </div>
  )
}

export const SendingMedia = (
  {
    mailOptions,
    mailRef,
    readBy,
    avatar,
    message,
    _id,
    senderTag,
    time = null,
    attechmentType
  }: {
    mailOptions: React.RefObject<HTMLDivElement | null>;
    mailRef: React.RefObject<HTMLDivElement | null>;
    readBy: string[];
    message?: string;
    _id: string;
    avatar?: string;
    senderTag?: string;
    time: Date | null;
    attechmentType: string
  }
) => {
  const disp = useAppDispatch()
  const currMessageRef = useRef<HTMLDivElement | null>(null);
  const [timer, setTimer] = useState<string>("");

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
    <div className="flex flex-col items-end gap-2 text-white selection:bg-[#fff0]">
      <div className="flex gap-2 text-white flex-row-reverse selection:bg-[#fff0]">
        <div className="w-[1.3rem] h-[1.3rem]"></div>
        <div className="bg-[#29927b] px-2 selection:hidden w-[6rem] text-white h-8 rounded-e-md rounded-b-md rounded-t-md gap-3 flex items-center justify-between">
          <div className="">
            <UploadWithProgress fileType={attechmentType} />
          </div>
        </div>
        <div className=""></div>
      </div>
      <div id={_id} className={`flex gap-2 text-white flex-row-reverse selection:bg-[#fff0]`}>
        <div className="">
          <div className='w-[1.r3em] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
            <img src={avatar || g} alt="😒" className="max-h-[1.5rem] h-full" />
          </div>
        </div>
        <div className="min-h-6 max-w-[80%] min-w-[3rem] ">
          <div ref={mailRef} data-msgid={_id} data-tag={senderTag} className={`bg-[#00F0FF] text-[#0F172A] p-1 rounded-md cursor-pointer`}>
            <div className="text-[10px] flex flex-row-reverse">{senderTag}</div>
            <div className="">
              {message}
            </div>
            <div className="text-[10px] w-full flex items-end justify-end">
              {
                readBy.length ?
                  (<span className="text-[#e915e3] font-bold">✓✓</span>) :
                  (<span className="text-[#1519d0]">✓</span>)
              }
            </div>
          </div>
          <div className="text-[10px]">
            <div>{timer}</div>
          </div>
        </div>
        <div ref={currMessageRef} className="flex"><CiMenuKebab cursor={'pointer'} className="current-message" /></div>
      </div>
    </div>

  )
}

type Props = {
  url: string;
  filename?: string;
};

export function DownloadWithProgress({ url, filename }: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  // choose file icon based on extension
  const getFileIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(lower)) return <FaFileImage size={13} />;
    if (/\.(mp4|mov|avi|webm|mkv)$/.test(lower)) return <FaFileVideo size={13} />;
    if (/\.(mp3|wav|ogg|flac)$/.test(lower)) return <FaFileAudio size={13} />;
    if (/\.(js|ts|tsx|json|html|css|py|java|cpp|c|rb|php)$/.test(lower))
      return <FaFileCode size={13} />;
    return <FaFileAlt size={13} />;
  };

  const handleDownload = async () => {
    setBusy(true);
    setProgress(0);

    abortController.current = new AbortController();

    try {
      const resp = await fetch(url, {
        mode: "cors",
        signal: abortController.current.signal,
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status} - ${resp.statusText}`);

      const contentLength = resp.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength, 10) : NaN;

      // get filename fallback
      let inferredName = filename;
      if (!inferredName) {
        const cd = resp.headers.get("Content-Disposition");
        if (cd) {
          const m = cd.match(/filename="?([^"]+)"?/);
          if (m) inferredName = m[1];
        }
      }
      if (!inferredName)
        inferredName = decodeURIComponent(url.split("/").pop() || "download");

      // stream reader
      const reader = resp.body?.getReader();
      if (!reader) {
        const blob = await resp.blob();
        triggerDownload(blob, inferredName);
        resetState();
        return;
      }

      const chunks: Uint8Array[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          // Ensure value is Uint8Array
          chunks.push(new Uint8Array(value.buffer ? value.buffer : value));
          received += value.length;
          if (!Number.isNaN(total)) {
            setProgress(Math.round((received / total) * 100));
          } else {
            setProgress(null);
          }
        }
      }

      const blob = new Blob(chunks as BlobPart[]);
      triggerDownload(blob, inferredName);
      resetState();
    } catch (err) {
      console.log('error in ', err)
      resetState();
    }
  };

  const triggerDownload = (blob: Blob, name: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  };

  const cancelDownload = () => {
    abortController.current?.abort();
  };

  const resetState = () => {
    setBusy(false);
    setProgress(null);
    abortController.current = null;
  };

  const inferredName = filename || decodeURIComponent(url.split("/").pop() || "file");

  return (
    <div className="w-full gap-[2rem] flex justify-between">
      <span style={{ fontSize: "1.5rem" }}>{getFileIcon(inferredName)}</span>
      {!busy ? (
        <button onClick={handleDownload} title="Download">
          <FaDownload size={13} />
        </button>
      ) : (
        <button onClick={cancelDownload} title="Cancel">
          <FaTimes size={13} />
        </button>
      )}
      {progress !== null && busy && (
        <span style={{ fontSize: "0.9rem" }}>{progress}%</span>
      )}
    </div>
  );
}

export function UploadWithProgress({ fileType }: { fileType: string }) {

  // choose file icon based on extension
  const getFileIcon = (fileType: string) => {
    if (fileType === 'img') return <FaFileImage />;
    if (fileType === 'vid') return <FaFileVideo />;
    if (fileType === 'audio') return <FaFileAudio />;
    if (fileType === 'doc')
      return <FaFileCode />;
    return <FaFileAlt />;
  };

  return (
    <div className="w-full gap-[2rem] flex justify-between">
      <span style={{ fontSize: "1.5rem" }}>{getFileIcon(fileType)}</span>
      <button title="Download">
        <IoMdCloudUpload size={20} />
      </button>
    </div>
  );
}

export const DeletedMessage = (
  {
    _id,
    avatar,
    senderTag,
    time = null
  }: {
    _id: string;
    avatar: string;
    senderTag: string;
    time: Date | null
  }
) => {
  const [timer, setTimer] = useState<string>("")

  useEffect(() => {
    if (time) {
      const currTime: string = getTimeDifference(time)
      setTimer(currTime)
    }
  }, [time])
  return (
    <div id={_id} data-user={senderTag} className={`flex gap-2 text-white`}>
      <div className="">
        <div className='w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
          <img src={avatar || g} alt="😒" className="max-h-[1.5rem] h-full" />
        </div>
      </div>
      <div className="min-h-5 max-w-[80%]">
        <div className="bg-[#101215] text-[#F8FAFC] p-1 rounded-md text-[12px]">
          <div className="text-[10px]">{senderTag}</div>
          This message is deleted or pending
        </div>
        <div className="text-[10px]">
          <div>{timer}</div>
        </div>
      </div>
      <div className="flex"></div>
    </div>
  )
}

export const DeletedMessageMe = (
  {
    _id,
    avatar,
    senderTag,
    time = null
  }: {
    _id: string;
    avatar: string;
    senderTag: string;
    time: Date | null
  }
) => {
  const [timer, setTimer] = useState<string>("")

  useEffect(() => {
    if (time) {
      const currTime: string = getTimeDifference(time)
      setTimer(currTime)
    }
  }, [time])
  return (
    <div id={_id} className={`flex gap-2 text-white flex-row-reverse `}>
      <div className="">
        <div className='w-[1.r3em] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
          <img src={avatar || g} alt="😒" className="max-h-[1.5rem] h-full" />
        </div>
      </div>
      <div className="min-h-6 max-w-[80%] ">
        <div className="bg-[#101215] text-[White] p-1 rounded-md text-[12px]">
          <div className="text-[10px] flex flex-row-reverse">{senderTag}</div>
          <div className="">
            This message is deleted
          </div>
        </div>
        <div className="text-[10px]">
          <div>{timer}</div>
        </div>
      </div>
      <div className="flex"></div>
    </div>
  )
}

export const MentionCardMe = (
  {
    mailOptions,
    mailRef,
    avatar,
    message,
    _id,
    senderTag,
    to,
    time = null
  }: {
    mailOptions: React.RefObject<HTMLDivElement | null>;
    mailRef: React.RefObject<HTMLDivElement | null>;
    message?: string;
    _id: string;
    avatar?: string;
    senderTag?: string;
    to: string;
    time: Date | null;
  }
) => {

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
    <div id={_id} className={`flex flex-row-reverse gap-2 text-white`}>
      <div ref={mailRef} data-msgId={_id} data-tag={senderTag} className="flex flex-col max-w-[80%] min-w-[3rem]">
        <div className="min-h-6 max-w-[100%] min-w-[3rem] flex flex-row-reverse gap-3 bg-green-700 items-center justify-between rounded-[5px_5px_0px_0]">
          <div className="w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]">
            <div className='w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
              <img src={avatar || g} alt="😒" className="max-h-[1.5rem] h-full" />
            </div>
          </div>
          <a className="" href={`#${_id}`}>
            <div className="text-sm font-serif cursor-pointer">@{to}</div>
          </a>
          <div ref={currMessageRef} className="flex"><CiMenuKebab cursor={'pointer'} className="current-message" /></div>
        </div>
        <div className=" the-msg min-h-6 max-w-[100%] min-w-[3rem] ">
          <div className="bg-[#00F0FF] text-[#0F172A] p-1 rounded-[0px_0_5px_5px] ">
            <div className="text-[10px] flex flex-row-reverse">{senderTag}</div>
            <div className="">
              {message}
            </div>
          </div>
          <div className="text-[10px]">
            <div>{timer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const MentionCard = (
  {
    mailOptions,
    mailRef,
    avatar,
    message,
    _id,
    senderTag,
    to,
    time = null
  }: {
    mailOptions: React.RefObject<HTMLDivElement | null>;
    mailRef: React.RefObject<HTMLDivElement | null>;
    message?: string;
    _id: string;
    avatar?: string;
    senderTag?: string;
    to: string;
    time: Date | null;
  }
) => {

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
    <div id={_id} className={`flex gap-2 text-white`}>
      <div ref={mailRef} data-msgId={_id} data-tag={senderTag} className="flex flex-col max-w-[80%] min-w-[3rem]">
        <div className="min-h-6 max-w-[100%] min-w-[3rem] flex gap-3 bg-green-700 items-center justify-between rounded-[5px_5px_0px_0]">
          <div className="w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]">
            <div className='w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
              <img src={avatar || g} alt="😒" className="max-h-[1.5rem] h-full" />
            </div>
          </div>
          <a className="" href={`#${_id}`}>
            <div className="text-sm font-serif cursor-pointer">@{to}</div>
          </a>
          <div ref={currMessageRef} className="flex"><CiMenuKebab cursor={'pointer'} className="current-message" /></div>
        </div>
        <div className="the-msg min-h-7 max-w-[100%] min-w-[3rem] ">
          <div className="bg-[#334155] text-[#F8FAFC] p-1 rounded-[0_0_5px_5px] "><div className="text-[10px]">{senderTag}</div>{message}</div>
          <div className="text-[10px]">
            <div>{timer}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const TypingIndicator = ({ avatar, trigger }: { avatar: string; trigger: boolean; }) => {
  return (
    <div className={`${trigger ? "flex" : 'hidden'} gap-2 text-white`}>
      <div className="">
        <div className='w-[1.3rem] h-[1.3rem] flex items-center shadow-[0_0_10px_#00F0FF55] justify-center overflow-hidden rounded-[16px] font-[#0F172A] bg-amber-300 md:h-[1.5rem] md:w-[1.5rem]'>
          <img src={avatar || g} alt="😒" className="max-h-[1.5rem] h-full" />
        </div>
      </div>
      <div className="the-msg min-h-7 max-w-[80%] min-w-[3rem] ">
        <div className="bg-[#334155] min-h-7 flex items-center text-[#F8FAFC] p-1 rounded-md ">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
          </div></div>
        <div className="text-[10px]">
        </div>
      </div>
    </div>

  )
}

export const MailMenu = ({ mailRef, }: {
  mailRef: React.RefObject<HTMLDivElement | null>;
  boxRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const disp = useAppDispatch()
  const messageId = useAppSelector((state) => state.temp.tempString)
  const contact = useAppSelector((state) => state.temp.selectedContact)
  // const user = useAppSelector((state) => state.auth.user)
  // const chatType = useAppSelector((state) => state.temp.chatListTypes)

  async function undoMessage() {
    console.log(`undo message is called`)
    try {
      await axios.post(`${api}/chat/message/del-msg`, {
        messageId,
        contactId: contact._id
      },
        { withCredentials: true }
      );

      disp(setTempString({ text: "" }));

      if (mailRef.current) mailRef.current.style.display = "none"

    } catch (error) {
      disp(setTempString({ text: "" }));
      console.log(`error in undo message: ${error}`);
    }
  }

  useEffect(() => {
    const model = document.getElementById("message-options");

    model?.addEventListener('mouseleave', () => {
      model.style.display = 'none'
    })

  }, [])



  return (
    // <section className="fixed flex items-center justify-center w-full">
    <section ref={mailRef} id="message-options" className={`absolute hidden flex-col items-center justify-center gap-1 px-2 rounded-sm max-w-max h-[4.5rem] text-[12px] text-blue-100 bg-slate-700 `}>
      <div className="cursor-pointer">forward to</div>
      <div onClick={undoMessage} className="cursor-pointer">undo message</div>
      {/* <div className="cursor-pointer" onClick={replayToChat} >callout</div> */}
      {/* <div className="cursor-pointer">cancel</div> */}
    </section>
  )
}

export const BottomButton = ({ count = 2 }: { count?: number }) => {

  useEffect(() => {
    const scrollBtn = document.getElementById('scrollBtn');
    const chatBox = document.getElementById('chatBox');
    function scrollEveent() {
      chatBox?.scrollBy({ top: chatBox.scrollHeight })
    }

    if (chatBox && scrollBtn) {
      scrollBtn.addEventListener('click', scrollEveent)
    }

    // cleanup to avoid multiple listeners
    return () => {
      if (scrollBtn) {
        scrollBtn.removeEventListener("click", scrollEveent);
      }
    };
  }, []);
  return (
    <div id="scrollBtn" className="fixed bottom-[5rem] right-[3rem] w-10 h-10 flex flex-col justify-center items-center bg-green-200 rounded-3xl text-black border-1 border-green-400 cursor-pointer">
      <div className="">{count}</div>
      <div className=""><FcDown /></div>
    </div>
  )
}

export const Notification = () => {
  const disp = useAppDispatch()
  const isActive = useAppSelector((state) => state.temp.notificationPopUp)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isActive) {
      audioRef.current?.play().catch((error) => {
        console.error("Audio play failed:", error);
      });
      timeout = setTimeout(() => {
        disp(notificationPup({ trigger: false }))
      }, 2000)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [isActive])

  return (
    <div className={`fixed top-0 left-0 z-50 w-full h-[3rem] ${isActive ? "flex" : "hidden"} flex-col items-center justify-center md:w-[20rem] md:left-10`}>
      <div className="w-[30%] md:w-[60%] h-[1.3rem] rounded-sm bg-green-500 text-black flex items-center justify-center text-sm font-light">
        <p className="">New Message</p>
      </div>
      <audio ref={audioRef} src={sound} className={`hidden`}></audio>
    </div>
  )
}

export const UploadingMedia = () => {
  const disp = useAppDispatch()
  const fileType = useAppSelector((state) => state.temp.fileType)
  const context = useContext(AppContext)

  if (!context) {
    throw new Error("Context not found")
  }

  const { messageFormData } = context

  function remove() {
    messageFormData.delete('attechment')
    disp(setHasAttechments({ trigger: false }))
    disp(triggetUploadType({ tp: '' }))
  }

  // useEffect(()=>{
  //   messageFormData.get('attechment')
  // }, [messageFormData])

  return (
    messageFormData.get('attechment') &&
    <div className="ml-2 mb-1 w-[4rem] h-[4rem] overflow-hidden rounded-[50%] bg-slate-400 flex items-center justify-center border-2 border-slate-300">
      <div className="w-full h-full flex items-center  justify-center cursor-pointer" onClick={remove}>
        {
          fileType === "img" ?
            (<FaImage onClick={remove} size={30} />)
            :
            fileType === "vid" ?
              (<FaVideo onClick={remove} size={30} />)
              :
              fileType === "doc" ?
                (<FaFile onClick={remove} size={30} />)
                :
                fileType === "audio" ?
                  (<FaFileAudio onClick={remove} size={30} />)
                  : null
        }
        {/* <FaImage  size={30}/> */}
      </div>
    </div>
  )
}

export const UploadingMediaProgress = () => {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error("Context not found")
  }

  const { messageFormData } = context

  return (
    messageFormData.get('attechment') &&
    <div className="ml-2 mb-1 w-[4rem] h-[4rem] overflow-hidden rounded-[50%] bg-slate-400 flex items-center justify-center border-2 border-slate-300">
      <div className="w-full h-full flex items-center  justify-center cursor-pointer">
        <FaFileImage size={30} />
      </div>
    </div>
  )
} 