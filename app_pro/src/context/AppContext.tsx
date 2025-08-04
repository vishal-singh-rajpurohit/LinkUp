import { createContext } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectContact } from '../app/functions/temp'


export interface appContextTypes {
    selectToTalk: (id: string) => void;
}


export const AppContext = createContext<appContextTypes | null>(null);


export const AppContextProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const disp = useAppDispatch()
    const contacts = useAppSelector((state) => state.auth.contacts)

    function selectToTalk(id: string) {
        const chat = contacts.filter((val) => val._id === id)
        disp(selectContact({ chat: chat[0] }))
    }

    const data: appContextTypes = {
        selectToTalk
    }

    return (
        <AppContext.Provider value={data} >{children}</AppContext.Provider>
    )
}