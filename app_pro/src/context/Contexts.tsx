import { createContext, type RefObject } from "react";
import type { Socket } from "socket.io-client";
import { Device, types } from "mediasoup-client";

export interface appContextTypes {
    selectToTalk: (id: string) => void;
    isAdmin: boolean;
    messageFormData: FormData
    handelFile: (files: FileList | null) => void;
}

export const AppContext = createContext<appContextTypes | null>(null);


export interface WSCTypes {
    socket: Socket | null;
}

export const WSContext = createContext<WSCTypes | null>(null);

export interface RtcTypes {
    deviceRef: RefObject<Device | null>;
    loadDevice: (rtpCapabilities: types.RtpCapabilities) => void;
    createSendTransport: () => Promise<void>;
    connectSendTransport: () => Promise<void>;
    createReciverTransport: () => Promise<void>;
    connectReciverTransport: () => Promise<void>;
    setRtpCapabilities: (value: types.RtpCapabilities) => void;
}

export const RtcContext = createContext<RtcTypes | null>(null);
