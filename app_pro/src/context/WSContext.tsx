import React, { createContext, useEffect, useMemo } from "react";
import io from "socket.io-client"
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { triggerOnline } from "../app/functions/temp";
import { triggerConOnline } from "../app/functions/auth";


interface WSCTypes {

}


const WSContext = createContext<WSCTypes | null>(null);


const WSProvider = ({ children }: { children: React.ReactNode }) => {
    const disp = useAppDispatch();
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn)
    const selectedContact = useAppSelector((state) => state.temp.selectedContact)


    const socket = useMemo(() => {
        if (isLoggedIn) {
            const newSocket = io(`http://localhost:5000`, {
                autoConnect: true,
                withCredentials: true,
                auth: {
                    token: localStorage.getItem("accessToken"),
                },
            });

            return newSocket
        }
    }, [isLoggedIn])

    useEffect(() => {
        if (!isLoggedIn) return;
        console.log(`socket is: `, socket);

        socket?.connect()

        socket?.on('connect', () => {
            console.log(`connected to the socket`);
        })

        socket?.on("is_online", ({ contactId }: { contactId: string; message: string }) => {
            console.log('your friend is online ', contactId);
            disp(triggerOnline({ contactId: contactId, trigger: true }))
            disp(triggerConOnline({ contactId: contactId, trigger: true }))
        })

        socket?.on("offline", ({ contactId }: { contactId: string; message: string }) => {
            console.log('your friend is online ', contactId);
            disp(triggerOnline({ contactId: contactId, trigger: false }))
            disp(triggerConOnline({ contactId: contactId, trigger: false }))
        })


    }, [socket, isLoggedIn])
    const data = {}
    return <WSContext.Provider value={data} >{children}</WSContext.Provider>

}

export default WSProvider