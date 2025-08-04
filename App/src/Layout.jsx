import { Outlet } from "react-router-dom";
import React, { useContext } from 'react'
import Header from "./Components/Header/Header";
import { CreateGroupChatModal, CreateOneOnOneModal } from "./Components/Minors/ContactsList";
import ChatContext from "./context/ChatContext.context";
import { CallRequestModal } from "./Components/Minors/Call";

const Layout = () => {
    const { openGroupCreate, setOpenGroupCreate } = useContext(ChatContext)
    return (
        <>
            <Header />
            <CallRequestModal />
            <CreateGroupChatModal closeModal={openGroupCreate} setCloseModal={setOpenGroupCreate} />
            <CreateOneOnOneModal />
            <Outlet />
        </>
    )
}

export default Layout