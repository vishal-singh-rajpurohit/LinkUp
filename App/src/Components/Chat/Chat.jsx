import React, { useContext, useEffect } from 'react'
import '../../Styles/Chats.css'
import '../../Styles/theme.css'

import { IoIosSearch, IoMdArrowRoundBack } from 'react-icons/io'

import x from '../../Assets/x.png'
import { IoCallSharp } from 'react-icons/io5'
import { MdMissedVideoCall } from 'react-icons/md'
import { SlOptionsVertical } from 'react-icons/sl'
import { RiMenu3Line } from 'react-icons/ri'
import { NavLink } from 'react-router-dom'
import ChatContext from '../../context/ChatContext.context'
import ContactProfile from '../Profile/ContactProfile'
import OnlyAdmins from '../Minors/OnlyAdmins'
import SelectMedia from '../Minors/SelectMedia'
import { ChatScroll, CreateGroupChatModal, GroupChatScroll, NoUsers, SearchContactItem, NotChat, SendOptions, ChatCard } from '../Minors/ContactsList'
import { CallRequestModal } from '../Minors/Call'

const Chat = () => {
  const { setOpenNav, theme, openProfile, userContacts, searchResut, isSearching, setOpenProfile, chatMode, reactNavigator, user } = useContext(ChatContext);
  const {setSearchKeyword, userGroupChats, userSecuredChat, openGroupCreate, setOpenGroupCreate } = useContext(ChatContext);
  const { selectedContact, messagesArr } = useContext(ChatContext);
  const { requestVideoCall } = useContext(ChatContext);

  useEffect(() => {
    if (window.innerWidth > 700) {
      setOpenNav(true);
    } else {
      if (!selectedContact.userName) {
        reactNavigator("/contact");
        setOpenNav(true)
      }
    }
  }, []);

  return (
    <>
    <section className="chat-main">
      <section className={`${theme ? 'chat-top-nav' : 'chat-top-nav-dark'}`} >
        <div className="chat-top-nav-right">
          <div className="search-div">
            <span className="search-icon">
              <IoIosSearch />
            </span>
            <input type="text" onChange={(e) => setSearchKeyword(e.target.value)} placeholder='search users , communities' className="search-input" />
          </div>
        </div>
        <div className="chat-top-nav-left">
          <div className="chat-top-nav-left-user-account">
            <img src={x} alt="" className="chat-top-nav-left-user-img" id='profile-image-user-profile' />
            <RiMenu3Line onClick={() => setOpenNav(true)} className='menu-ham' size={30} />
          </div>
          <div className="chat-top-nav-left-user-name" id='user-name-profile'>
            <p className="my-name" >{user.userName} </p>
            <span className="status" id='status-indicatior'>
              online
              <span className="status-indicatior" ></span>
            </span>
          </div>
        </div>
      </section>
      <section className={`${theme ? "main-chats" : "main-chats-dark "}`}>
        <section className={`${theme ? 'chat-contacts' : ' chat-contacts-dark'}`} id='full-chats'>
          {
            !isSearching ?
              <div className="contact-grid">
                {
                  chatMode === "oneOnOne"
                    ?
                    <ChatScroll contactsList={userContacts} />
                    :
                    chatMode === "groupChat"
                      ?
                      <GroupChatScroll contactsList={userGroupChats} />
                      :
                      <ChatScroll contactsList={userSecuredChat} />
                }
              </div>
              :
              // Executes if search is on
              <div className="contact-grid">
                {
                  searchResut.length <= 0 ?
                    <NoUsers />
                    :
                    searchResut.map((item, index) => (
                      <SearchContactItem isExistingInContact={item.already_in_contact} userName={item.userName} userId={item._id} index={index} avatar={"avatar"} messageTimer={"12: 55"} totalNewMessages={2} />
                    ))
                }
              </div>
          }
        </section>
        {/* Chat Box */}
        <section className="chat-message">
          {
            !selectedContact.userName ? <NotChat /> : <>
              <ContactProfile />
              <div className="message-top" style={{ display: openProfile ? 'none' : 'flex' }}>
                <div className="message-top-left">
                  <div className="back-button-res" id='back-button'>
                    <NavLink to={"/contact"} ><IoMdArrowRoundBack size={30} /></NavLink>
                  </div>
                  <div className="contact-list-avatar">
                    <img src={x} onClick={() => setOpenProfile(true)} alt="" className="contact-avatar" />
                  </div>
                  <div className="chat-top-nav-left-user-name">
                    <p className="my-name">{selectedContact.userName}</p>
                    <span className="status">
                      <span className="status-indicatior" id='indi-status-btm'></span>
                      online
                    </span>
                  </div>
                </div>
                <div className="message-top-right">
                  <ul className="message-top-icons">
                    <li className="message-top-li-icons"><IoCallSharp size={35} /></li>
                    <li className="message-top-li-icons"><MdMissedVideoCall onClick={requestVideoCall} size={35} /></li>
                  </ul>
                  <ul className="message-top-ham">
                    <SlOptionsVertical size={25} />
                  </ul>
                </div>
              </div>
              <SelectMedia />
              <div className="message-bottom" style={{ display: openProfile ? 'none' : 'flex' }}>
                <div className="chats-box">
                  <div className="message-grid">
                    <div className="chats-grid ">
                      {
                        messagesArr.length !== 0 ? messagesArr.map((message, index) => (
                          <ChatCard  senderId={message.sender._id} messageId={message._id} message={message.message} key={index} />
                        )) : <NotChat />
                      }
                    </div>
                  </div>
                </div>
                {/* Send options */}
                <SendOptions />
              </div>
              <OnlyAdmins />
            </>
          }
        </section>
      </section>
    </section>
    </>
  )
}

export default Chat