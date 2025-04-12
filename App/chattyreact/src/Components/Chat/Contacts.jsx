import React, { useContext } from 'react'
import x from '../../Assets/x.png'
import '../../Styles/Chats.css'
import '../../Styles/theme.css'
import { IoIosSearch } from 'react-icons/io'
import { RiMenu3Line } from 'react-icons/ri'
import ChatContext from '../../context/ChatContext.context'
import { ChatScroll, CreateGroupChatModal, GroupChatScroll, NoUsers, SearchContactItem } from '../Minors/ContactsList'

const Contacts = () => {
    const { setOpenNav, theme, setSearchKeyword, isSearching, searchResut, chatMode, user } = useContext(ChatContext)
    const { userContacts, userSecuredChat, userGroupChats, openGroupCreate, setOpenGroupCreate, selectedTalks } = useContext(ChatContext)

    return (
        <section className={`chat-main ${theme ? '' : 'dbg1'}`}>
            <CreateGroupChatModal closeModal={openGroupCreate} setCloseModal={setOpenGroupCreate} />
            <section className={`${theme ? 'chat-top-nav' : 'chat-top-nav-dark'}`}>
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
                        <p className="my-name" >{user.userName}</p>
                        <span className="status" id='status-indicatior'>
                            online
                            <span className="status-indicatior" ></span>
                        </span>
                    </div>
                </div>
            </section>
            <section className={`${theme ? 'chat-contacts' : ' chat-contacts-dark'}`}>
                {!isSearching ?
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
                                    <SearchContactItem conId={item._id} selectChat={selectedTalks} userName={item.userName} index={index} avatar={"avatar"} lastMessage={item.lastMessage || false} messageTimer={"12: 55"} totalNewMessages={2} />
                                ))
                        }
                    </div>}
            </section>
        </section>
    )
}


export {
    Contacts
}    