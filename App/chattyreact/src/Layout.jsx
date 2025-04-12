import { Outlet } from "react-router-dom";


import React from 'react'
import Header from "./Components/Header/Header";
import { CreateOneOnOneModal } from "./Components/Minors/ContactsList";

const Layout = () => {
    return (
        <>
            <Header />
            <CreateOneOnOneModal />
            <Outlet />
        </>
    )
}

export default Layout