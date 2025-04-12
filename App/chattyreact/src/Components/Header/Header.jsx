import React, { useContext } from 'react'
import '../../Styles/theme.css'
import '../../Styles/Header.css'
import { FaRegUserCircle } from 'react-icons/fa'
import { BiSolidMessageDetail } from 'react-icons/bi'
import { HiUserGroup } from 'react-icons/hi'
import { RiFileShield2Fill } from 'react-icons/ri'
import { MdOutlineSettings } from 'react-icons/md'
import { NavLink } from 'react-router-dom'
import { CgCloseR } from 'react-icons/cg'
import ChatContext from '../../context/ChatContext.context'

const Header = () => {
  const { openNav, setOpenNav, theme, setChatMode } = useContext(ChatContext);

  return (
    <section className={`${theme ? 'Header' : 'Header-dark'}`} style={{ display: openNav ? 'flex' : 'none' }}>
      <div className="top-header" id='full-header'>
        <ul className="top-header-ul">
          <li className="header-li"><FaRegUserCircle size={40} className='nav-item' color='white' /></li>
          <li className="header-li"><BiSolidMessageDetail onClick={() => setChatMode("oneOnOne")} size={40} className='nav-item' color='white' /></li>
          <li className="header-li" ><HiUserGroup size={40} onClick={() => setChatMode("groupChat")} className='nav-item' color='white' /></li>
          <li className="header-li"><RiFileShield2Fill onClick={() => setChatMode("secured")} size={40} className='nav-item' color='white' /></li>
        </ul>
      </div>
      <div className="top-header" id='res-header'>
        <ul className="top-header-ul">
          <li className="header-li" onClick={() => setOpenNav(false)}><CgCloseR size={40} className='nav-item' color='white' /></li>
          <li className="header-li"><FaRegUserCircle size={40} className='nav-item' color='white' /></li>
          <li className="header-li"><BiSolidMessageDetail onClick={() => setChatMode("oneOnOne")} size={40} className='nav-item' color='white' /></li>
          <li className="header-li"><HiUserGroup onClick={() => setChatMode("groupChat")} size={40} className='nav-item' color='white' /></li>
          <li className="header-li"><RiFileShield2Fill onClick={() => setChatMode("secured")} size={40} className='nav-item' color='white' /></li>
        </ul>
      </div>
      <div className="bottom-header ">
        <ul className="bottom-header-ul">
          <NavLink to={'/settings'} ><li className="bottom-header-li"><MdOutlineSettings size={40} className='nav-item' color='white' /></li></NavLink>
        </ul>
      </div>
    </section>

  )
}

export default Header