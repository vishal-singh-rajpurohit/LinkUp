import { createContext, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectContact, selectGroup } from '../app/functions/temp'


export interface appContextTypes {
    selectToTalk: (id: string) => void;
    isAdmin: boolean;
}


export const AppContext = createContext<appContextTypes | null>(null);


export const AppContextProvider = ({ children }: {
    children: React.ReactNode
}) => {
    const disp = useAppDispatch()
    const contacts = useAppSelector((state) => state.auth.contacts)
    const selectedContact = useAppSelector((state) => state.temp.selectedContact)
    const groups = useAppSelector((state) => state.auth.groups)
    const archContacts = useAppSelector((state) => state.auth.safer)
    const chatTypes = useAppSelector((state) => state.temp.chatListTypes)
    const user = useAppSelector((state) => state.auth.user)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)

    function selectToTalk(id: string) {
        if (chatTypes === 1) {
            const chat = contacts.filter((val) => val._id === id)
            // console.log(`contac is ${JSON.stringify(chat[0], null, 2)}`);
            disp(selectContact({ chat: chat[0] }))
        }
        else if (chatTypes === 2) {
            const chat = groups.filter((val) => val._id === id)
            disp(selectGroup({ chat: chat[0] }))
        } else if (chatTypes === 3) {
            const chat = archContacts.filter((val) => val._id === id)
            disp(selectContact({ chat: chat[0] }))
        }
    }

    useEffect(() => {
        setIsAdmin(false)
        if (selectedContact.isGroup) {
            selectedContact.members?.forEach((member) => {
                if (member._id === user._id) {
                    setIsAdmin(member.isAdmin)
                }
            })
        }
    }, [selectedContact])


    const data: appContextTypes = {
        selectToTalk,
        isAdmin
    }

    return (
        <AppContext.Provider value={data} >{children}</AppContext.Provider>
    )
}