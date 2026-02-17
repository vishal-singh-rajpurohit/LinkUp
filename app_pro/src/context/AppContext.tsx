import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectContact, selectGroup, setHasAttechments } from '../app/functions/temp'
import { AppContext, type appContextTypes } from "./Contexts";
const API = import.meta.env.VITE_API;

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
            console.log("select To talk called")
            const chat = contacts.filter((val) => val._id === id)
            disp(selectContact({ chat: chat[0] }))
        }
        else if (chatTypes === 2) {
            const chat = groups.filter((val) => val._id === id)
            disp(selectGroup({ chat: chat[0] }))
        }
        else if (chatTypes === 3) {
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
    }, [selectedContact, user._id])

    const messageFormData = new FormData()
    const fileType = useAppSelector((state) => state.temp.fileType)

    async function handelFile(files: FileList | null) {
        if (files?.[0]) {
            if (fileType === 'img') {
                console.log('attachment : ')
                messageFormData.append('attechment', files[0])
                disp(setHasAttechments({trigger: true}))
            }
            else if (fileType === 'vid') {
                messageFormData.append('attechment', files[0])
                disp(setHasAttechments({trigger: true}))
            }
            else if (fileType === 'audio') {
                messageFormData.append('attechment', files[0])
                disp(setHasAttechments({trigger: true}))
            }
            else if (fileType === 'doc') {
                messageFormData.append('attechment', files[0])
                disp(setHasAttechments({trigger: true}))
            }
            
        }
    }

    const data: appContextTypes = {
        selectToTalk,
        isAdmin,
        handelFile,
        messageFormData
    }

    return (
        <AppContext.Provider value={data} >{children}</AppContext.Provider>
    )
}