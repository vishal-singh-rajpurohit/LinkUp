import React, { useContext, useEffect, useState } from 'react'
import '../../Styles/Profile.css'
import '../../Styles/theme.css'
import '../../Styles/Settings.css'
import { IoMdArrowRoundBack } from 'react-icons/io'
import ChatContext from '../../context/ChatContext.context'
import { GiMoonClaws, GiSunkenEye, GiSunRadiations } from 'react-icons/gi'
import { PiEyeClosedFill } from 'react-icons/pi'
import { TbKeyboardOff } from 'react-icons/tb'
import { TiMessageTyping } from 'react-icons/ti'
import {  MdOfflineBolt } from 'react-icons/md'
import { HiOutlineStatusOffline } from 'react-icons/hi'
import { NavLink } from 'react-router-dom'

const Settings = () => {
    const { setOpenNav, navigator, theme, setTheme , showTyping, setShowTyping, showOnline, setShowOnline} = useContext(ChatContext);

    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        setOpenNav(false)
    }, [])

    const goBack = () => {
        if (window.innerWidth > 700) {
            setOpenNav(true)
            navigator('/')
        } else {
            navigator('/contact')
        }
    }

    return (
        <section className={`settings-page ${theme? '': 'dbg3' }`}>
            <div className="profile-top-edit setting-top">
                <div className="profile-edit-right">
                    <div className="go-back">
                        <IoMdArrowRoundBack onClick={() => goBack()} size={30} />
                    </div>
                </div>
                <div className="profile-edit-right">
                    <div className="theme-buttons">
                        <span className="theme-button" onClick={() => setTheme(true)} id={`${theme ? 'theme lite' : ''}`} ><GiSunRadiations size={20} /></span>
                        <span className="theme-button" onClick={() => setTheme(false)} id={`${theme ? '' : 'theme dark'}`} ><GiMoonClaws size={20} /></span>
                    </div>
                </div>
            </div>
            <div className="setting-main">
                <div className="setting-list">
                    <div className="setting-title-title">
                        <p className="setting-title-setting">Profile Settings</p>
                    </div>
                    <div className="profile-edit-right">
                        <NavLink to={'/profile'}><button className="setting-profile-button">Profile</button></NavLink>
                        
                    </div>
                </div>
                <div className="setting-list">
                    <div className="setting-title-title">
                        <p className="setting-title-setting">Show Online</p>
                    </div>
                    <div className="profile-edit-right">
                        <div className="theme-buttons">
                            <span className="theme-button" onClick={() => setShowOnline(true)} id={`${showOnline ? 'theme lite' : ''}`} ><MdOfflineBolt size={20} /></span>
                            <span className="theme-button" onClick={() => setShowOnline(false)} id={`${showOnline ? '' : 'theme dark'}`} ><HiOutlineStatusOffline size={20} /></span>
                        </div>
                    </div>
                </div>
                <div className="setting-list">
                    <div className="setting-title-title">
                        <p className="setting-title-setting">Change Theme</p>
                    </div>
                    <div className="profile-edit-right">
                        <div className="theme-buttons">
                            <span className="theme-button" onClick={() => setTheme(true)} id={`${theme ? 'theme lite' : ''}`} ><GiSunRadiations size={20} /></span>
                            <span className="theme-button" onClick={() => setTheme(false)} id={`${theme ? '' : 'theme dark'}`} ><GiMoonClaws size={20} /></span>
                        </div>
                    </div>
                </div>
                <div className="setting-list">
                    <div className="setting-title-title">
                        <p className="setting-title-setting">Show Typing</p>
                    </div>
                    <div className="profile-edit-right">
                        <div className="theme-buttons">
                            <span className="theme-button" onClick={() => setShowTyping(true)} id={`${showTyping ? 'theme lite' : ''}`} ><TiMessageTyping size={20} /></span>
                            <span className="theme-button" onClick={() => setShowTyping(false)} id={`${showTyping ? '' : 'theme dark'}`} ><TbKeyboardOff size={20} /></span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="setting-list setting-inputs">
                <div className="setting-input-box setting-list">
                    <input type={`${showPassword ? 'text' : 'password'}`} value={1213232123545435} className="inout-password-setting" />
                </div>
                <div className="profile-edit-right">
                    <div className="theme-buttons">
                        <span className="theme-button" onClick={() => setShowPassword(false)} id={`${showPassword ? '' : 'theme dark'}`} ><PiEyeClosedFill size={20} /></span>
                        <span className="theme-button" onClick={() => setShowPassword(true)} id={`${showPassword ? 'theme lite' : ''}`} ><GiSunkenEye size={20} /></span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Settings