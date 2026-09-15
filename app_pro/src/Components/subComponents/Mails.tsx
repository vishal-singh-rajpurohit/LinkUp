import { CiMenuKebab } from "react-icons/ci"
import g from '../../assets/no_dp.png'
import React, { useContext, useEffect, useRef, useState } from "react"
import { notificationPup, setTempString } from "../../app/functions/temp";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getTimeDifference } from "../../helpers/timeConverter";
import { FcDown } from "react-icons/fc";
import { AppContext } from "../../context/Contexts";
import { FaFile, FaImage, FaVideo, FaDownload, FaTimes, FaFileImage, FaFileVideo, FaFileAudio, FaFileCode, FaFileAlt } from "react-icons/fa";
import { IoMdCloudUpload } from "react-icons/io"
import { RiCheckDoubleLine } from "react-icons/ri";
import sound from '../../assets/sound.mp3'
import callSound from '../../assets/caller.mp3'
import dp from '../../assets/dp.jpg'
import axios from "axios";
import { getEmojiOnlyDetails, REACTION_EMOJIS } from "../../helpers/emojiHelper";

const api = import.meta.env.VITE_API;

export const Mail = ({
  mailOptions,
  avatar,
  readBy,
  _id,
  senderTag,
  time = null,
  cipherText,
  displayText,
}: {
  mailOptions: React.RefObject<HTMLDivElement | null>;
  avatar: string;
  readBy: string[];
  _id: string;
  senderTag: string;
  time: Date | null;
  cipherText: string;
  displayText: string;
}) => {
  const currMessageRef = useRef<HTMLDivElement | null>(null);
  const [timer, setTimer] = useState("");
  const [wrapEnable, setWrapEnable] = useState(false);
  const emojiInfo = getEmojiOnlyDetails(displayText);
  const contact = useAppSelector((s) => s.temp.selectedContact);

  async function sendQuickReaction(emoji: string) {
    if (!contact?._id) return;
    try {
      await axios.post(
        `${api}/chat/message/send-msg`,
        {
          message: emoji,
          contactId: contact._id,
          longitude: "00",
          latitude: "00",
          contain_files: false,
        },
        { withCredentials: true }
      );
      const chatBox = document.getElementById("chatBox");
      chatBox?.scrollBy({ top: chatBox.scrollHeight, behavior: "smooth" });
    } catch (err) {
      console.log("Error sending quick reaction:", err);
    }
  }

  useEffect(() => {
    if (displayText.length > 120) setWrapEnable(true);
  }, [displayText]);

  useEffect(() => {
    if (time) setTimer(getTimeDifference(time));
  }, [time]);

  useEffect(() => {
    const el = currMessageRef.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      const menu = mailOptions.current;
      if (!menu) return;

      menu.style.display = "flex";
      menu.style.top = `${e.clientY}px`;
      menu.style.left = `${e.clientX}px`;
    };

    el.addEventListener("click", handleClick);
    return () => el.removeEventListener("click", handleClick);
  }, [mailOptions]);

  return (
    <div
      id={_id}
      data-msgid={_id}
      data-sendertag={senderTag}
      data-read={readBy.length}
      data-tag={senderTag}
      data-cipher={cipherText}
      className="flex gap-2.5 items-end text-[var(--c-text-primary)] my-1 group max-w-[85%]"
    >
      <div className="shrink-0 mb-1">
        <div className="w-7 h-7 flex items-center justify-center overflow-hidden rounded-full border border-white/10 shadow-sm bg-slate-700">
          <img src={avatar || dp} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className={`flex flex-col gap-0.5 ${emojiInfo.isEmojiOnly ? 'min-w-0' : 'min-w-[4rem]'}`}>
        <div className="text-[11px] font-semibold text-[var(--c-text-muted)] pl-1">{senderTag}</div>
        
        {emojiInfo.isEmojiOnly ? (
          <div className="flex flex-col items-start select-text py-0.5">
            <div 
              className={`select-text transition-all duration-200 hover:scale-115 active:scale-95 cursor-pointer origin-bottom-left filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
                emojiInfo.count === 1 
                  ? "text-6xl sm:text-7xl leading-none py-1 animate-in zoom-in-75 duration-200"
                  : emojiInfo.count <= 3
                  ? "text-4xl sm:text-5xl leading-tight py-1 tracking-wide"
                  : emojiInfo.count <= 6
                  ? "text-3xl sm:text-4xl leading-snug py-0.5"
                  : "text-2xl"
              }`}
            >
              {displayText}
            </div>
            <div className="text-[10px] text-white/60 bg-slate-900/70 backdrop-blur-md px-2 py-0.5 rounded-full mt-1 border border-white/10 shadow-sm font-medium flex items-center gap-1 select-none">
              <span>{timer}</span>
            </div>
          </div>
        ) : (
          <div className="glass-card text-[var(--c-text-primary)] p-3 rounded-2xl rounded-bl-xs text-xs shadow-md border border-white/10">
            <div className={`${wrapEnable ? "line-clamp-4" : ""} whitespace-pre-wrap break-words leading-relaxed`}>
              {displayText}
            </div>
            {displayText.length > 120 && (
              <button
                type="button"
                className="mt-1 text-[10px] font-bold accent-text underline cursor-pointer"
                onClick={() => setWrapEnable((s) => !s)}
              >
                {wrapEnable ? "Show more" : "Show less"}
              </button>
            )}
            <div className="text-[9px] text-[var(--c-text-muted)] text-right mt-1 font-medium">{timer}</div>
          </div>
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-center bg-slate-900/80 backdrop-blur-md border border-white/15 px-1.5 py-0.5 rounded-xl shadow-lg">
        {REACTION_EMOJIS.slice(0, 3).map((em, i) => (
          <button
            key={i}
            type="button"
            onClick={() => sendQuickReaction(em)}
            className="text-xs hover:scale-130 active:scale-90 transition-transform p-0.5 rounded cursor-pointer"
            title={`React with ${em}`}
          >
            {em}
          </button>
        ))}
        <div 
          ref={currMessageRef} 
          className="cursor-pointer p-0.5 rounded hover:bg-white/10 text-[var(--c-text-muted)] hover:text-white"
          title="More options"
        >
          <CiMenuKebab size={14} />
        </div>
      </div>
    </div>
  );
};

export const MailMe = ({
  mailOptionsHandler,
  mailRef,
  readBy,
  avatar,
  _id,
  senderTag,
  time = null,
  cipherText,
  displayText
}: {
  mailOptionsHandler: (x: number, y: number, msgId: string) => void;
  mailRef: React.RefObject<HTMLDivElement | null>;
  readBy: string[];
  message?: string;
  _id: string;
  avatar?: string;
  senderTag?: string;
  time: Date | null;
  cipherText: string;
  displayText: string;
}) => {
  const disp = useAppDispatch();
  const contact = useAppSelector((s) => s.temp.selectedContact);
  const currMessageRef = useRef<HTMLDivElement | null>(null);
  const [timer, setTimer] = useState<string>("");
  const [wrapEnable, setWrapEnable] = useState<boolean>(false);
  const emojiInfo = getEmojiOnlyDetails(displayText);

  async function sendQuickReaction(emoji: string) {
    if (!contact?._id) return;
    try {
      await axios.post(
        `${api}/chat/message/send-msg`,
        {
          message: emoji,
          contactId: contact._id,
          longitude: "00",
          latitude: "00",
          contain_files: false,
        },
        { withCredentials: true }
      );
      const chatBox = document.getElementById("chatBox");
      chatBox?.scrollBy({ top: chatBox.scrollHeight, behavior: "smooth" });
    } catch (err) {
      console.log("Error sending quick reaction:", err);
    }
  }

  useEffect(() => {
    if (typeof displayText === 'string' && displayText.length > 120) {
      setWrapEnable(true);
    }
  }, [displayText]);

  useEffect(() => {
    if (time) {
      setTimer(getTimeDifference(time));
    }
  }, [time]);

  useEffect(() => {
    disp(setTempString({ text: _id }));

    const el = currMessageRef.current;
    if (!el) return;

    const handleClick = (e: MouseEvent) => {
      disp(setTempString({ text: _id }));
      mailOptionsHandler(e.clientX, e.clientY, _id);
    };

    el.addEventListener('click', handleClick);
    return () => {
      el.removeEventListener('click', handleClick);
    };
  }, [_id, disp, mailOptionsHandler]);

  return (
    <div 
      id={_id} 
      data-sendertag={senderTag} 
      data-read={readBy.length} 
      data-msgid={_id} 
      data-tag={senderTag} 
      data-cipher={cipherText} 
      className="flex gap-2.5 items-end flex-row-reverse my-1 group max-w-[85%] self-end"
    >
      <div className="shrink-0 mb-1">
        <div className="w-7 h-7 flex items-center justify-center overflow-hidden rounded-full border border-white/10 shadow-sm bg-slate-700">
          <img src={avatar || g} alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className={`flex flex-col gap-0.5 items-end ${emojiInfo.isEmojiOnly ? 'min-w-0' : 'min-w-[4rem]'}`}>
        {emojiInfo.isEmojiOnly ? (
          <div 
            ref={mailRef} 
            data-msgid={_id} 
            data-tag={senderTag}
            className="flex flex-col items-end select-text py-0.5"
          >
            <div 
              className={`select-text transition-all duration-200 hover:scale-115 active:scale-95 cursor-pointer origin-bottom-right filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
                emojiInfo.count === 1 
                  ? "text-6xl sm:text-7xl leading-none py-1 animate-in zoom-in-75 duration-200"
                  : emojiInfo.count <= 3
                  ? "text-4xl sm:text-5xl leading-tight py-1 tracking-wide"
                  : emojiInfo.count <= 6
                  ? "text-3xl sm:text-4xl leading-snug py-0.5"
                  : "text-2xl"
              }`}
            >
              {displayText}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] font-medium bg-slate-900/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white/80 shadow-sm border border-white/10 select-none">
              <span>{timer}</span>
              {readBy.length ? (
                <span className="text-emerald-400 font-extrabold"><RiCheckDoubleLine size={13} /></span>
              ) : (
                <span className="text-white/70 font-semibold text-[11px]">✓</span>
              )}
            </div>
          </div>
        ) : (
          <div 
            ref={mailRef} 
            data-msgid={_id} 
            data-tag={senderTag}
            className="accent-bg text-black p-3 rounded-2xl rounded-br-xs text-xs font-medium shadow-lg hover:brightness-105 transition"
          >
            <div className={`${wrapEnable ? "line-clamp-4" : ""} whitespace-pre-wrap break-words leading-relaxed`}>
              {displayText}
            </div>
            {typeof displayText === 'string' && displayText.length > 120 && (
              <button 
                type="button" 
                className="mt-1 text-[10px] font-bold underline cursor-pointer opacity-80 hover:opacity-100" 
                onClick={() => setWrapEnable(!wrapEnable)}
              >
                {wrapEnable ? 'Show more' : 'Show less'}
              </button>
            )}
            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] font-bold opacity-75">
              <span>{timer}</span>
              {readBy.length ? (
                <span className="text-black font-extrabold"><RiCheckDoubleLine size={13} /></span>
              ) : (
                <span>✓</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-center bg-slate-900/80 backdrop-blur-md border border-white/15 px-1.5 py-0.5 rounded-xl shadow-lg">
        {REACTION_EMOJIS.slice(0, 3).map((em, i) => (
          <button
            key={i}
            type="button"
            onClick={() => sendQuickReaction(em)}
            className="text-xs hover:scale-130 active:scale-90 transition-transform p-0.5 rounded cursor-pointer"
            title={`React with ${em}`}
          >
            {em}
          </button>
        ))}
        <div 
          ref={currMessageRef} 
          className="cursor-pointer p-0.5 rounded hover:bg-white/10 text-[var(--c-text-muted)] hover:text-white"
          title="More options"
        >
          <CiMenuKebab size={14} />
        </div>
      </div>
    </div>
  );
};

export function getMediaType(url: string, type?: string | null): 'image' | 'video' | 'audio' | 'document' {
  const t = type?.toLowerCase() || '';
  if (t === 'img' || t === 'image') return 'image';
  if (t === 'vid' || t === 'video') return 'video';
  if (t === 'audio') return 'audio';
  if (t === 'doc' || t === 'document') return 'document';

  const cleanUrl = url.split('?')[0].toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/.test(cleanUrl) || url.includes('/image/upload/')) return 'image';
  if (/\.(mp4|webm|mov|mkv|avi|m4v)$/.test(cleanUrl) || url.includes('/video/upload/')) return 'video';
  if (/\.(mp3|wav|ogg|m4a|aac|flac)$/.test(cleanUrl)) return 'audio';
  return 'document';
}

export const MailAttechmentMe = ({
  mailOptionsHandler,
  mailOptions,
  readBy = [],
  avatar,
  _id,
  senderTag = "You",
  time = null,
  attechmentLink = "",
  fileType = null,
  cipherText,
  displayText,
  onImageClick,
}: {
  mailOptionsHandler?: (x: number, y: number, msgId: string) => void;
  mailOptions?: React.RefObject<HTMLDivElement | null>;
  mailRef?: React.RefObject<HTMLDivElement | null>;
  readBy?: string[];
  message?: string;
  _id: string;
  avatar?: string;
  senderTag?: string;
  time: Date | null;
  fileType?: string | null;
  attechmentLink?: string;
  cipherText: string;
  displayText: string;
  onImageClick?: (url: string) => void;
}) => {
  const disp = useAppDispatch();
  const currMessageRef = useRef<HTMLDivElement | null>(null);
  const [timer, setTimer] = useState<string>("");
  const mediaType = getMediaType(attechmentLink, fileType);

  useEffect(() => {
    if (time) {
      setTimer(getTimeDifference(time));
    }
  }, [time]);

  const handleKebabClick = (e: React.MouseEvent) => {
    disp(setTempString({ text: _id }));
    if (mailOptionsHandler) {
      mailOptionsHandler(e.clientX, e.clientY, _id);
    } else if (mailOptions?.current) {
      mailOptions.current.style.display = 'flex';
      mailOptions.current.style.top = `${e.clientY}px`;
      mailOptions.current.style.left = `${e.clientX}px`;
    }
  };

  const hasCaption = Boolean(displayText && displayText.trim() !== "");

  return (
    <div
      data-msgid={_id}
      data-sendertag={senderTag}
      data-read={readBy.length}
      data-tag={senderTag}
      data-cipher={cipherText}
      className="flex flex-col items-end gap-1.5 my-1.5 group max-w-[85%] sm:max-w-[70%] self-end"
    >
      <div id={_id} className="flex gap-2 items-end flex-row-reverse">
        <div className="shrink-0 mb-1">
          <div className="w-7 h-7 flex items-center justify-center overflow-hidden rounded-full border border-white/10 shadow-sm bg-slate-700">
            <img src={avatar || g} alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 max-w-full">
          {attechmentLink !== "" && (
            <div className="overflow-hidden rounded-2xl rounded-br-xs border border-white/15 bg-black/40 shadow-xl transition-all">
              {mediaType === 'image' && (
                <div 
                  onClick={() => onImageClick ? onImageClick(attechmentLink) : window.open(attechmentLink, '_blank')}
                  className="relative group/img cursor-pointer overflow-hidden max-w-[320px] max-h-[360px]"
                >
                  <img
                    src={attechmentLink}
                    alt="attachment"
                    className="w-full h-auto max-h-[360px] object-cover transition-transform duration-300 group-hover/img:scale-102"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-2">
                    <span className="text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs font-medium">Click to expand</span>
                    <a
                      href={attechmentLink}
                      download
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition cursor-pointer"
                      title="Download"
                    >
                      <FaDownload size={11} />
                    </a>
                  </div>
                </div>
              )}

              {mediaType === 'video' && (
                <div className="max-w-[320px] bg-black/60">
                  <video
                    src={attechmentLink}
                    controls
                    preload="metadata"
                    className="w-full max-h-[300px] object-contain"
                  />
                </div>
              )}

              {mediaType === 'audio' && (
                <div className="p-3 w-72 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <FaFileAudio size={16} />
                    <span>Audio Clip</span>
                  </div>
                  <audio src={attechmentLink} controls className="w-full h-8" />
                </div>
              )}

              {mediaType === 'document' && (
                <div className="p-2.5 w-64">
                  <DownloadWithProgress url={attechmentLink} />
                </div>
              )}
            </div>
          )}

          {hasCaption ? (
            <div className="accent-bg text-black px-3 py-2 rounded-2xl rounded-br-xs text-xs font-medium shadow-md max-w-full break-words">
              <div>{displayText}</div>
              <div className="flex items-center justify-end gap-1 mt-1 text-[9px] font-bold opacity-75">
                <span>{timer}</span>
                {readBy.length ? (
                  <span className="text-black font-extrabold"><RiCheckDoubleLine size={13} /></span>
                ) : (
                  <span>✓</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[9px] font-semibold text-[var(--c-text-muted)] bg-black/40 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-xs">
              <span>{timer}</span>
              {readBy.length ? (
                <span className="text-emerald-400 font-bold"><RiCheckDoubleLine size={12} /></span>
              ) : (
                <span>✓</span>
              )}
            </div>
          )}
        </div>

        <div
          ref={currMessageRef}
          onClick={handleKebabClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center cursor-pointer p-1 rounded-lg hover:bg-white/10 text-[var(--c-text-muted)] hover:text-white"
          title="More options"
        >
          <CiMenuKebab size={16} />
        </div>
      </div>
    </div>
  );
};

export const MailAttechment = ({
  mailOptionsHandler,
  mailOptions,
  avatar,
  _id,
  senderTag,
  time = null,
  attechmentLink = "",
  fileType = null,
  cipherText,
  displayText,
  onImageClick,
}: {
  mailOptionsHandler?: (x: number, y: number, msgId: string) => void;
  mailOptions?: React.RefObject<HTMLDivElement | null>;
  mailRef?: React.RefObject<HTMLDivElement | null>;
  message?: string;
  readBy?: string[];
  _id: string;
  avatar: string;
  senderTag: string;
  time: Date | null;
  fileType?: string | null;
  attechmentLink: string;
  cipherText: string;
  displayText: string;
  onImageClick?: (url: string) => void;
}) => {
  const disp = useAppDispatch();
  const currMessageRef = useRef<HTMLDivElement | null>(null);
  const [timer, setTimer] = useState<string>("");
  const mediaType = getMediaType(attechmentLink, fileType);

  useEffect(() => {
    if (time) {
      setTimer(getTimeDifference(time));
    }
  }, [time]);

  const handleKebabClick = (e: React.MouseEvent) => {
    disp(setTempString({ text: _id }));
    if (mailOptionsHandler) {
      mailOptionsHandler(e.clientX, e.clientY, _id);
    } else if (mailOptions?.current) {
      mailOptions.current.style.display = 'flex';
      mailOptions.current.style.top = `${e.clientY}px`;
      mailOptions.current.style.left = `${e.clientX}px`;
    }
  };

  const hasCaption = Boolean(displayText && displayText.trim() !== "");

  return (
    <div
      data-sendertag={senderTag}
      data-msgid={_id}
      data-tag={senderTag}
      data-cipher={cipherText}
      className="flex flex-col items-start gap-1.5 my-1.5 group max-w-[85%] sm:max-w-[70%]"
    >
      <div id={_id} className="flex gap-2 items-end">
        <div className="shrink-0 mb-1">
          <div className="w-7 h-7 flex items-center justify-center overflow-hidden rounded-full border border-white/10 shadow-sm bg-slate-700">
            <img src={avatar || g} alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 max-w-full">
          <div className="text-[10px] font-semibold text-[var(--c-text-muted)] ml-1">{senderTag}</div>

          {attechmentLink !== "" && (
            <div className="overflow-hidden rounded-2xl rounded-bl-xs border border-white/15 bg-black/40 shadow-xl transition-all">
              {mediaType === 'image' && (
                <div 
                  onClick={() => onImageClick ? onImageClick(attechmentLink) : window.open(attechmentLink, '_blank')}
                  className="relative group/img cursor-pointer overflow-hidden max-w-[320px] max-h-[360px]"
                >
                  <img
                    src={attechmentLink}
                    alt="attachment"
                    className="w-full h-auto max-h-[360px] object-cover transition-transform duration-300 group-hover/img:scale-102"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-2">
                    <span className="text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs font-medium">Click to expand</span>
                    <a
                      href={attechmentLink}
                      download
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition cursor-pointer"
                      title="Download"
                    >
                      <FaDownload size={11} />
                    </a>
                  </div>
                </div>
              )}

              {mediaType === 'video' && (
                <div className="max-w-[320px] bg-black/60">
                  <video
                    src={attechmentLink}
                    controls
                    preload="metadata"
                    className="w-full max-h-[300px] object-contain"
                  />
                </div>
              )}

              {mediaType === 'audio' && (
                <div className="p-3 w-72 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <FaFileAudio size={16} />
                    <span>Audio Clip</span>
                  </div>
                  <audio src={attechmentLink} controls className="w-full h-8" />
                </div>
              )}

              {mediaType === 'document' && (
                <div className="p-2.5 w-64">
                  <DownloadWithProgress url={attechmentLink} />
                </div>
              )}
            </div>
          )}

          {hasCaption ? (
            <div className="glass-card text-[var(--c-text-primary)] px-3 py-2 rounded-2xl rounded-bl-xs text-xs shadow-md border border-white/10 max-w-full break-words">
              <div>{displayText}</div>
              <div className="text-[9px] text-[var(--c-text-muted)] text-right mt-1 font-medium">{timer}</div>
            </div>
          ) : (
            <div className="text-[9px] text-[var(--c-text-muted)] bg-black/40 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-xs ml-1">
              {timer}
            </div>
          )}
        </div>

        <div
          ref={currMessageRef}
          onClick={handleKebabClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center self-center cursor-pointer p-1 rounded-lg hover:bg-white/10 text-[var(--c-text-muted)] hover:text-white"
          title="More options"
        >
          <CiMenuKebab size={16} />
        </div>
      </div>
    </div>
  );
};

export const SendingMedia = ({
  avatar,
  _id,
  senderTag,
  time = null,
  attechmentType,
  cipherText,
  displayText
}: {
  mailOptions?: React.RefObject<HTMLDivElement | null>;
  mailRef?: React.RefObject<HTMLDivElement | null>;
  readBy?: string[];
  message?: string;
  _id: string;
  avatar?: string;
  senderTag?: string;
  time: Date | null;
  attechmentType: string;
  cipherText: string;
  displayText: string;
}) => {
  const [timer, setTimer] = useState<string>("");

  useEffect(() => {
    if (time) {
      setTimer(getTimeDifference(time));
    }
  }, [time]);

  const hasCaption = Boolean(displayText && displayText.trim() !== "");

  return (
    <div data-msgid={_id} data-tag={senderTag} data-cipher={cipherText} className="flex flex-col items-end gap-1.5 my-1.5 max-w-[85%] self-end animate-in fade-in duration-150">
      <div className="glass-panel p-2.5 rounded-2xl border border-white/10 shadow-md w-52">
        <UploadWithProgress fileType={attechmentType} />
      </div>

      <div id={_id} className="flex gap-2.5 items-end flex-row-reverse">
        <div className="shrink-0 mb-1">
          <div className="w-7 h-7 flex items-center justify-center overflow-hidden rounded-full border border-white/10 shadow-sm bg-slate-700">
            <img src={avatar || g} alt="" className="w-full h-full object-cover" />
          </div>
        </div>
        {hasCaption ? (
          <div className="accent-bg text-black px-3 py-2 rounded-2xl rounded-br-xs text-xs font-medium shadow-lg opacity-90 max-w-full break-words">
            <div>{displayText}</div>
            <div className="text-[9px] font-bold text-right mt-1 opacity-75">{timer} (Sending...)</div>
          </div>
        ) : (
          <div className="text-[9px] font-medium text-[var(--c-text-muted)] bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5">
            {timer} (Sending...)
          </div>
        )}
      </div>
    </div>
  );
};

type Props = {
  url: string;
  filename?: string;
};

export function DownloadWithProgress({ url, filename }: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const abortController = useRef<AbortController | null>(null);

  const getFileIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(lower)) return <FaFileImage size={16} className="text-emerald-400" />;
    if (/\.(mp4|mov|avi|webm|mkv)$/.test(lower)) return <FaFileVideo size={16} className="text-sky-400" />;
    if (/\.(mp3|wav|ogg|flac)$/.test(lower)) return <FaFileAudio size={16} className="text-amber-400" />;
    if (/\.(js|ts|tsx|json|html|css|py|java|cpp|c|rb|php)$/.test(lower))
      return <FaFileCode size={16} className="text-purple-400" />;
    return <FaFileAlt size={16} className="text-gray-400" />;
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

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const contentLength = resp.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength, 10) : NaN;

      let inferredName = filename;
      if (!inferredName) {
        const cd = resp.headers.get("Content-Disposition");
        if (cd) {
          const m = cd.match(/filename="?([^"]+)"?/);
          if (m) inferredName = m[1];
        }
      }
      if (!inferredName) inferredName = decodeURIComponent(url.split("/").pop() || "download");

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
      window.open(url, "_blank");
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
    <div className="w-full flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        {getFileIcon(inferredName)}
        <span className="truncate max-w-[100px] text-[var(--c-text-primary)] font-medium">{inferredName}</span>
      </div>
      
      {!busy ? (
        <button onClick={handleDownload} title="Download" className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[var(--c-text-primary)] transition cursor-pointer">
          <FaDownload size={12} />
        </button>
      ) : (
        <button onClick={cancelDownload} title="Cancel" className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition cursor-pointer">
          <FaTimes size={12} />
        </button>
      )}
      {progress !== null && busy && (
        <span className="text-[10px] accent-text font-bold">{progress}%</span>
      )}
    </div>
  );
}

export function UploadWithProgress({ fileType }: { fileType: string }) {
  const getFileIcon = (fileType: string) => {
    if (fileType === 'img') return <FaFileImage className="text-emerald-400" size={18} />;
    if (fileType === 'vid') return <FaFileVideo className="text-sky-400" size={18} />;
    if (fileType === 'audio') return <FaFileAudio className="text-amber-400" size={18} />;
    if (fileType === 'doc') return <FaFileCode className="text-purple-400" size={18} />;
    return <FaFileAlt className="text-gray-400" size={18} />;
  };

  return (
    <div className="w-full flex items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        {getFileIcon(fileType)}
        <span className="text-xs font-semibold text-[var(--c-text-primary)] capitalize">Uploading {fileType}...</span>
      </div>
      <IoMdCloudUpload size={18} className="accent-text animate-pulse" />
    </div>
  );
}

export const DeletedMessage = ({
  _id,
  avatar,
  senderTag,
  time = null
}: {
  _id: string;
  avatar: string;
  senderTag: string;
  time: Date | null
}) => {
  const [timer, setTimer] = useState<string>("");

  useEffect(() => {
    if (time) {
      setTimer(getTimeDifference(time));
    }
  }, [time]);

  return (
    <div id={_id} data-user={senderTag} className="flex gap-2.5 items-center text-xs my-1 italic text-[var(--c-text-muted)]">
      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
        <img src={avatar || g} alt="" className="w-full h-full object-cover opacity-60" />
      </div>
      <div className="glass-card px-3 py-1.5 rounded-xl border border-white/5 bg-white/5">
        <span>This message was deleted</span>
        <span className="ml-2 text-[9px] not-italic opacity-70">{timer}</span>
      </div>
    </div>
  );
};

export const DeletedMessageMe = ({
  _id,
  avatar,
  senderTag: _senderTag,
  time = null
}: {
  _id: string;
  avatar: string;
  senderTag: string;
  time: Date | null
}) => {
  const [timer, setTimer] = useState<string>("");

  useEffect(() => {
    if (time) {
      setTimer(getTimeDifference(time));
    }
  }, [time]);

  return (
    <div id={_id} className="flex gap-2.5 items-center flex-row-reverse text-xs my-1 italic text-[var(--c-text-muted)] self-end">
      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
        <img src={avatar || g} alt="" className="w-full h-full object-cover opacity-60" />
      </div>
      <div className="glass-card px-3 py-1.5 rounded-xl border border-white/5 bg-white/5">
        <span>You deleted this message</span>
        <span className="ml-2 text-[9px] not-italic opacity-70">{timer}</span>
      </div>
    </div>
  );
};

export const TypingIndicator = ({ avatar, trigger }: { avatar: string; trigger: boolean; }) => {
  if (!trigger) return null;
  return (
    <div className="flex gap-2 items-center text-xs my-1 animate-in fade-in duration-200">
      <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
        <img src={avatar || g} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="glass-card px-3 py-2 rounded-2xl rounded-bl-xs border border-white/10 flex items-center space-x-1.5">
        <span className="w-1.5 h-1.5 accent-bg rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 accent-bg rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 accent-bg rounded-full animate-bounce"></span>
      </div>
    </div>
  );
};

export const MailMenu = ({ visible, x, y, onClose }: {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
}) => {
  const disp = useAppDispatch();
  const messageId = useAppSelector((state) => state.temp.tempString);
  const contact = useAppSelector((state) => state.temp.selectedContact);

  async function undoMessage() {
    try {
      await axios.post(`${api}/chat/message/del-msg`, {
        messageId,
        contactId: contact._id
      }, { withCredentials: true });

      disp(setTempString({ text: "" }));
      onClose();
    } catch (error) {
      disp(setTempString({ text: "" }));
      console.log(`error in undo message: ${error}`);
    }
  }

  async function sendReactionFromMenu(em: string) {
    if (!contact?._id) return;
    try {
      await axios.post(
        `${api}/chat/message/send-msg`,
        {
          message: em,
          contactId: contact._id,
          longitude: "00",
          latitude: "00",
          contain_files: false,
        },
        { withCredentials: true }
      );
      const chatBox = document.getElementById("chatBox");
      chatBox?.scrollBy({ top: chatBox.scrollHeight, behavior: "smooth" });
      onClose();
    } catch (err) {
      console.log("Error sending reaction from menu:", err);
    }
  }

  if (!visible) return null;

  return (
    <section
      onMouseLeave={onClose}
      className="fixed flex flex-col p-2 rounded-2xl text-xs glass-panel shadow-2xl border border-white/15 z-50 animate-in fade-in zoom-in-95 duration-100 gap-1.5"
      style={{ top: y, left: x }}
    >
      <div className="flex items-center gap-1 px-1 py-0.5 border-b border-white/10 pb-1.5">
        {REACTION_EMOJIS.map((em, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendReactionFromMenu(em)}
            className="text-base hover:scale-130 active:scale-95 transition-transform p-1 rounded-lg hover:bg-white/10 cursor-pointer"
            title={`React with ${em}`}
          >
            {em}
          </button>
        ))}
      </div>
      <button 
        type="button" 
        onClick={undoMessage} 
        className="px-3 py-1.5 rounded-lg hover:bg-red-500/20 text-red-400 font-medium transition cursor-pointer text-left flex items-center gap-2"
      >
        <span>🗑️</span> Delete / Undo message
      </button>
    </section>
  );
};

export const BottomButton = ({ count: _count = 2 }: { count?: number }) => {
  useEffect(() => {
    const scrollBtn = document.getElementById('scrollBtn');
    const chatBox = document.getElementById('chatBox');
    function scrollEvent() {
      chatBox?.scrollBy({ top: chatBox.scrollHeight, behavior: 'smooth' });
    }

    if (chatBox && scrollBtn) {
      scrollBtn.addEventListener('click', scrollEvent);
    }

    return () => {
      if (scrollBtn) {
        scrollBtn.removeEventListener("click", scrollEvent);
      }
    };
  }, []);

  return (
    <div 
      id="scrollBtn" 
      className="fixed bottom-20 right-8 z-30 p-2.5 glass-card rounded-full accent-text border border-white/15 shadow-2xl cursor-pointer hover:scale-110 transition flex items-center justify-center"
      title="Scroll to Bottom"
    >
      <FcDown size={18} />
    </div>
  );
};

export const Notification = () => {
  const disp = useAppDispatch();
  const isActive = useAppSelector((state) => state.temp.notificationPopUp);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isActive) {
      audioRef.current?.play().catch((error) => {
        console.error("Audio play failed:", error);
      });
      timeout = setTimeout(() => {
        disp(notificationPup({ trigger: false }));
      }, 2000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive, disp]);

  return (
    <div className={`fixed top-4 right-4 z-50 ${isActive ? "flex" : "hidden"} items-center justify-center animate-in slide-in-from-top duration-300`}>
      <div className="glass-panel px-4 py-2 rounded-xl accent-bg text-black font-bold shadow-2xl flex items-center gap-2 text-xs">
        <span>🔔 New Message Received</span>
      </div>
      <audio ref={audioRef} src={sound} className="hidden"></audio>
    </div>
  );
};

export const CallNotification = () => {
  const disp = useAppDispatch();
  const isActive = useAppSelector((state) => state.call.callStatus);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isActive === "INCOMING") {
      audioRef.current?.play().catch((error) => {
        console.error("Audio play failed:", error);
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    timeout = setTimeout(() => {
      disp(notificationPup({ trigger: false }));
    }, 20);

    return () => {
      clearTimeout(timeout);
    };
  }, [isActive, disp]);

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${isActive === "INCOMING" ? "flex" : "hidden"} items-center justify-center`}>
      <audio ref={audioRef} src={callSound} className="hidden"></audio>
    </div>
  );
};

export const UploadingMedia = ({
  uploadProgress = 0,
  isUploading = false,
}: {
  uploadProgress?: number;
  isUploading?: boolean;
}) => {
  const fileType = useAppSelector((state) => state.temp.fileType);
  const context = useContext(AppContext);

  if (!context) return null;
  const { selectedFile, filePreview, clearSelectedFile } = context;

  if (!selectedFile) return null;

  const fileSize = selectedFile.size ? (
    selectedFile.size < 1024 * 1024 
      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
      : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
  ) : '';

  return (
    <div className="mx-2 mb-1 p-2.5 rounded-2xl glass-card border border-white/20 flex flex-col gap-1.5 max-w-sm shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {filePreview ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-emerald-500/30 bg-black/40 shadow-inner relative">
              {fileType === "vid" ? (
                <video src={filePreview} className="w-full h-full object-cover" muted />
              ) : (
                <img src={filePreview} alt="preview" className="w-full h-full object-cover" />
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5 border border-white/10">
              {fileType === "vid" && <FaVideo size={20} className="text-sky-400" />}
              {fileType === "audio" && <FaFileAudio size={20} className="text-amber-400" />}
              {fileType === "doc" && <FaFile size={20} className="text-purple-400" />}
              {(!fileType || fileType === "img") && <FaImage size={20} className="text-emerald-400" />}
            </div>
          )}
          <div className="min-w-0 flex flex-col">
            <span className="text-xs font-semibold text-[var(--c-text-primary)] truncate max-w-[200px]">
              {selectedFile.name}
            </span>
            <span className="text-[10px] text-[var(--c-text-muted)] font-medium">
              {isUploading ? (
                <span className="text-emerald-400 font-semibold animate-pulse">Uploading {uploadProgress > 0 ? `${uploadProgress}%` : '...'}</span>
              ) : (
                <>
                  {fileSize ? `${fileSize} • ` : ''}<span className="capitalize">{fileType || 'Media'}</span> ready to send
                </>
              )}
            </span>
          </div>
        </div>
        {!isUploading && (
          <button 
            type="button" 
            onClick={clearSelectedFile} 
            className="p-1.5 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer shrink-0"
            title="Remove attachment"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>

      {isUploading && uploadProgress > 0 && (
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-400 transition-all duration-150 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const ImageLightbox = ({
  url,
  onClose
}: {
  url: string | null;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (!url) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [url, onClose]);

  if (!url) return null;

  return (
    <div 
      className="fixed inset-0 z-500 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-end gap-2 mb-2">
          <a
            href={url}
            download
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Download full resolution"
          >
            <FaDownload size={12} />
            <span>Download</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-red-500/30 text-white hover:text-red-400 transition cursor-pointer"
            title="Close preview (ESC)"
          >
            <FaTimes size={16} />
          </button>
        </div>
        <img
          src={url}
          alt="Full preview"
          className="max-w-[90vw] max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/15 select-none"
        />
      </div>
    </div>
  );
};
