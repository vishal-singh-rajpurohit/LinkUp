import{io} from "socket.io-client"
import { createContext } from "react";
import ChatContext from "./ChatContext.context";

export const SocketContext = createContext();

export const SocketProvider = ({children}) =>{


    
    let data = {}

    return <SocketContext.Provider value={data}>{children}</SocketContext.Provider>
}