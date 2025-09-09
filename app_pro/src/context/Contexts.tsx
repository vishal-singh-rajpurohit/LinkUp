import { createContext } from "react";
import type { Socket } from "socket.io-client";

export interface appContextTypes {
    selectToTalk: (id: string) => void;
    isAdmin: boolean;
    messageFormData: FormData
    handelFile: (files: FileList| null) => void;
}

export const AppContext = createContext<appContextTypes | null>(null);


export interface WSCTypes {
    socket: Socket | null
}


export const WSContext = createContext<WSCTypes | null>(null);
