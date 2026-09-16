import { createContext, type RefObject } from "react";
import type { Socket } from "socket.io-client";


export interface appContextTypes {
    selectToTalk: (id: string) => void;
    isAdmin: boolean;
    messageFormData: FormData;
    selectedFile: File | null;
    filePreview: string | null;
    handelFile: (files: FileList | File[] | File | null, explicitType?: string) => void;
    clearSelectedFile: () => void;
}

export const AppContext = createContext<appContextTypes | null>(null);


export interface WSCTypes {
    socket: Socket | null;
    makeACall: () => void;
    answerVideoCall: () => void;
    denayCall: () => void;
    createAnswer: () => void;
    clearCall: () => void;
    toggleAudio: () => void;
    toggleVideo: () => void;
    isAudioOn: boolean;
    isVideoOn: boolean;
    video: {
        localVideoRef: RefObject<HTMLVideoElement | null>;
        remoteVideoRef: RefObject<HTMLVideoElement | null>;
        localStreamRef: RefObject<MediaStream | null>;
        remoteStream: MediaStream | null;
    };
}

export const WSContext = createContext<WSCTypes | null>(null);

export interface RtcTypes { }

export const RtcContext = createContext<RtcTypes | null>(null);

export interface PeerTypes { }

export const PeerContext = createContext<RtcTypes | null>(null)
