import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectContact, selectGroup, setHasAttechments, triggetUploadType } from '../app/functions/temp'
import { AppContext, type appContextTypes } from "./Contexts";
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

    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const messageFormDataRef = useRef<FormData>(new FormData())

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

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (filePreview) {
                URL.revokeObjectURL(filePreview);
            }
        };
    }, [filePreview]);

    function clearSelectedFile() {
        if (filePreview) {
            URL.revokeObjectURL(filePreview);
        }
        setFilePreview(null);
        setSelectedFile(null);
        messageFormDataRef.current.delete('attechment');
        disp(setHasAttechments({ trigger: false }));
        disp(triggetUploadType({ tp: '' }));
    }

    function handelFile(files: FileList | File[] | File | null, explicitType?: string) {
        if (!files) return;
        let file: File | null = null;
        if (files instanceof File) {
            file = files;
        } else if ('length' in files && files.length > 0) {
            file = files[0];
        }
        if (!file) return;

        // Validate max 30MB file size
        const MAX_SIZE = 30 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            alert("The selected file exceeds the 30MB size limit. Please choose a smaller file.");
            return;
        }

        // Determine or infer media type
        let resolvedType = explicitType;
        const lowerName = file.name.toLowerCase();
        if (!resolvedType || resolvedType === 'undefined') {
            if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/.test(lowerName)) {
                resolvedType = 'img';
            } else if (file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v)$/.test(lowerName)) {
                resolvedType = 'vid';
            } else if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)$/.test(lowerName)) {
                resolvedType = 'audio';
            } else {
                resolvedType = 'doc';
            }
        }

        // Clean previous preview if exists
        if (filePreview) {
            URL.revokeObjectURL(filePreview);
            setFilePreview(null);
        }

        if (resolvedType === 'img' || resolvedType === 'vid' || file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const previewUrl = URL.createObjectURL(file);
            setFilePreview(previewUrl);
        }

        setSelectedFile(file);
        messageFormDataRef.current.delete('attechment');
        messageFormDataRef.current.append('attechment', file);

        disp(triggetUploadType({ tp: resolvedType }));
        disp(setHasAttechments({ trigger: true }));
    }

    const data: appContextTypes = {
        selectToTalk,
        isAdmin,
        handelFile,
        clearSelectedFile,
        selectedFile,
        filePreview,
        messageFormData: messageFormDataRef.current
    }

    return (
        <AppContext.Provider value={data} >{children}</AppContext.Provider>
    )
}