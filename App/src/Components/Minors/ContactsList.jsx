import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AiFillSetting, AiOutlinePlus } from 'react-icons/ai'
import { SlOptionsVertical } from "react-icons/sl";
import "../../Styles/Minros/Contact-list.css"
import x from '../../Assets/x.png'
import ChatContext from '../../context/ChatContext.context'
import { FaArrowRight, FaPlus, FaWindowClose } from 'react-icons/fa'
import { IoMdArrowRoundForward } from 'react-icons/io'
import { LuSmilePlus } from 'react-icons/lu'

const ContactsList = () => {
    return (
        <section className="contact-component-list">
            <div className="contacts-count-in-room">
                <div className="total-contacts-room">Total 250</div>
                <div className="groups-setting-box"><AiFillSetting size={30} /></div>
            </div>
            <div className="contact-list-sub-div">
                <div className="contact-list-component">
                    <div className="contact-list-box">
                        <div className="contect-list-box-left">
                            <div className="contact-list-avatar">
                                <span className="status-indicatior" id='status-id'></span>
                                <img src={x} alt="" className="contact-avatar" />
                            </div>
                            <div className="contact-list-user-name">
                                <p className="contact-user-name">Pikachu</p>
                            </div>
                        </div>
                        <div className="contact-list-user-time">
                            <span className="admin-only-text" style={{ color: '#4c8f12' }}>Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

const ContactItems = ({ userName, index, avatar, lastMessage, messageTimer, totalNewMessages, selectChat, conId }) => {
    const { theme } = useContext(ChatContext)
    return (
        <div key={index} className={`${theme ? 'contact-list' : 'contact-list-dark'}`} onClick={() => selectChat(conId)}>
            <div className="contact-list-box">
                <div className="contect-list-box-left">
                    <div className="contact-list-avatar">
                        {/* <span className="status-indicatior" id='status-id'></span> */}
                        <img src={avatar || null} alt="" className="contact-avatar" />
                    </div>
                    <div className="contact-list-user-name">
                        <p className="contact-user-name">{userName}</p>
                        <span className="latest-message">{lastMessage}</span>
                    </div>
                </div>
                <div className="contact-list-user-time">
                    <span className="time">{messageTimer}</span>
                    <span className="messages-count-indi">{totalNewMessages}</span>
                </div>
            </div>
        </div>
    )
}

const SearchContactItem = ({ userName, index, userId, avatar, lastMessage, messageTimer, totalNewMessages, isExistingInContact, selectChat, conId }) => {
    const { theme, saveContact } = useContext(ChatContext)

    return (
        <div key={index} className={`${theme ? 'contact-list' : 'contact-list-dark'}`}>
            <div className="contact-list-box">
                <div className="contect-list-box-left">
                    <div className="contact-list-avatar">
                        {/* <span className="status-indicatior" id='status-id'></span> */}
                        <img src={avatar || null} alt="" className="contact-avatar" />
                    </div>
                    <div className="contact-list-user-name">
                        <p className="contact-user-name">{userName}</p>
                    </div>
                </div>
                <div className="contact-list-user-time">
                    {
                        isExistingInContact ?
                            <FaArrowRight size={25} /> :
                            <AiOutlinePlus size={25} onClick={() => saveContact(conId)} />
                    }

                </div>
            </div>
        </div>
    )
}

const GroupChatScroll = ({ contactsList }) => {
    const { selectedTalks } = useContext(ChatContext)
    return <>
        {
            contactsList.length !== 0 ?
                <>
                    <CreateGroupChatTop />
                    {
                        contactsList.map((item, index) => (
                            <ContactItems userName={item.contact_det.groupName} conId={item.contact_det._id} selectChat={selectedTalks} index={index} avatar={"avatar"} lastMessage={"Hii i am here"} messageTimer={"12: 55"} totalNewMessages={2} />
                        ))
                    }
                </>

                :
                <>
                    <CreateGroupChatTop />
                    <NoUsers />
                </>
        }
    </>
}

const ChatScroll = ({ contactsList }) => {
    const { selectedTalks } = useContext(ChatContext)
    return <>
        {
            contactsList.length !== 0 ? contactsList.map((item, index) => (
                <ContactItems kay={index} selectChat={selectedTalks} conId={item.contact_det._id}  userName={item.contact_name} index={index} avatar={"avatar"} lastMessage={item.contact_det.lastMessage} messageTimer={"12: 55"} totalNewMessages={2} />
            )) : <NoUsers />
        }
    </>
}

const CreateGroupChatTop = () => {
    const { setOpenGroupCreate } = useContext(ChatContext)
    return (
        <section className="group-chat-section">
            <div className="group-chat-div">
                <button className="create-group-caht" onClick={() => setOpenGroupCreate(true)}>create group chat</button>
            </div>
        </section>
    )
}

const AddToGroupChat = ({ userName, index, avatar, select, userId, contactList }) => {
    const { theme } = useContext(ChatContext)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        setChecked(contactList.includes(userId));
        console.log("contactList ", contactList)
    }, [contactList]);

    return (
        <div key={index} className={`${theme ? 'contact-list contact-list-create-contact' : 'contact-list-dark'}`} onClick={() => select(userId)} >
            <div className="contact-list-box">
                <div className="contect-list-box-left">
                    <div className="contact-list-avatar">
                        <img src={avatar || null} alt="" className="contact-avatar" />
                    </div>
                    <div className="contact-list-user-name">
                        <p className="contact-user-name">{userName}</p>
                    </div>
                </div>
                <div className="contact-list-user-time">
                    <input type="checkbox" checked={checked} name="" id="" className="contact-list-input" />
                </div>
            </div>
        </div>
    )
}

const CreateGroupChatModal = ({ closeModal, setCloseModal }) => {
    const { search2, setUserGroupChats } = useContext(ChatContext)
    const [groupName, setGroupName] = useState('')
    const [onlyAdmins, setOnlyAdmins] = useState(false)
    const [contactList, setContactList] = useState([])
    const [searchContactList, setSearchContactList] = useState([])
    const [searchWord, setSearchWord] = useState("")

    const close = () => {
        setGroupName("")
        setOnlyAdmins(false)
        setContactList([])
        setCloseModal(false)
    }

    const selectContact = (ContactId) => {
        const contacins = contactList.includes(ContactId);

        if (contacins) {
            for (let i = 0; i < contactList.length; i++) {
                if (contactList[i] === ContactId) {
                    setContactList(contactList.filter(id => id !== ContactId))
                }
            }
            console.log(contactList)
        } else {
            setContactList([...contactList, ContactId])
            console.log(contactList)
        }

    }

    const createGroup = async () => {
        let whoCanSendMessage = onlyAdmins ? "ONLY_ADMINS" : "ALL"

        if (contactList.length <= 2 || groupName.trim() === "") {
            alert("Please select at least one contact and enter a group name")
            return
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_CHAT_API}/chat/create-group-chat`,
                {
                    contacts: contactList,
                    groupName: groupName,
                    whoCanSendMessage: whoCanSendMessage,
                    isSearchable: false
                },
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                })

            const newGroupDetails = response.data.data.newGroupDetails
            setUserGroupChats((prev) => [...prev, { contact_det: newGroupDetails }])

            setCloseModal(false)
        } catch (error) {
            console.log("Error while creating new group")
        }
    }

    useEffect(() => {
        search2(searchWord, setSearchContactList)
        console.log("search reasult: ", searchWord)
    }, [searchWord])

    return (
        <section className="create-group-chat-section" style={{ display: closeModal ? 'flex' : 'none' }}>
            <div className="create-group-caht-section">
                <div className="create-group-caht-top">
                    <h3 className="group-chat-heading">Create Group Chat</h3>
                </div>
                <div className="group-info">
                    <div className="pofile-image-div">
                        <div className="group-caht-profile-image-">
                            <input type="file" accept="image/*" className="chat-profile-img" src="" alt="" />
                        </div>
                        <div className="profile-image-text">Select group profile image</div>
                    </div>
                    <div className="create-group-caht-top t2">
                        <div className="profile-image-text">Enter group name</div>
                        <input onChange={(e) => setGroupName(e.target.value)} value={groupName} type="text" placeholder='group name' className="create-group-chat-name" />
                    </div>
                </div>
                <div className="group-sections">
                    <h3 className="group-section-h create-group-caht-top">Group settings</h3>
                </div>
                <div className="create-group-chat-settings">
                    <div className="group-chat-setting">
                        <input type="checkbox" value={onlyAdmins} onChange={(e) => setOnlyAdmins(e.target.value)} name="whocan" id="whocan" className="group-caht-setting-cb" />
                        <label htmlFor="whocan" className="group-chat-setting-laberl">Only admins can send messages</label>
                    </div>
                </div>
                <div className="create-group-chat-contacts-">
                    <div className="create-contact-chat-contacts-search-div">
                        <input type="text" onChange={(e) => setSearchWord(e.target.value)} placeholder='search users' className="create-contact-chat-contacts-search-inp" />
                    </div>
                    <div className="contact-grid-2 create-contact-grid">
                        {
                            searchContactList ?
                                searchContactList?.map((user, item) => (<AddToGroupChat userName={user.userName} select={selectContact} userId={user._id} contactList={contactList} />))
                                :
                                <NoUsers />
                        }

                    </div>
                </div>
                <div className="create-group-chat-buttons">
                    <button className="create-button-group-modal" onClick={createGroup}>Create group</button>
                    <button className="create-button-group-modal cancel-button" onClick={close}>Cancel</button>
                </div>
            </div>
        </section>
    )
}

const CreateOneOnOneModal = () => {
    const { openOneOnOneModal, setOpenOneOnOneModal, tempId, setTempId, tempName, setTempName } = useContext(ChatContext)

    const saveContact = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_CHAT_API}/chat/save-contact`,
                {
                    reciverId: tempId,
                    groupName: tempName
                },
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                })
            console.log("Saved contact: ", response);

            setTempId("")
            setTempName("")
            setOpenOneOnOneModal(false)

        } catch (error) {
            console.log("Error while saving contact ", error);

        }
    }


    return (
        <section className="create-one-on-one-section" style={{ display: openOneOnOneModal ? 'flex' : 'none' }}>
            <div className="create-one-on-one-div">
                <div className="create-one-on-one-dv">
                    <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder='enter contact name' className="create-one-on-one-input" />
                </div>
                <div className="create-one-on-one-dv">
                    <input type="checkbox" name="cb-secure" id="" className="create-one-on-cb" />
                    <label htmlFor="cb-secure" className="create-one-on-one-label">Secure the chat</label>
                </div>
                <div className="create-one-on-one-dv">
                    <button className="create-one-on-one-button" onClick={saveContact}>Save</button>
                </div>
            </div>
        </section>
    )
}

const NoUsers = () => {
    return (
        <section className="no-user-section">
            <p className="no-user-para">No Chats</p>
        </section>
    )
}

const NotChat = () => {
    return (
        <section className="not-any-chat-section">
            <div className="not-any-chat-div">Select Contact To Start Chating</div>
        </section>
    )
}

const SendOptions = () => {
    const { canMessageInChat, theme, openSelectDocs, setSelectDocs, selectedContact, sendMessage, user, message, setMessage } = useContext(ChatContext)

    return (
        <div className="send-options" style={{ display: canMessageInChat ? 'flex' : 'none' }}>
            <div className="send-options-input">
                <input type="text" placeholder='Type your message here' value={message} onChange={(e) => setMessage(e.target.value)} className={`${theme ? 'send-options-input-text' : 'send-options-input-text-dark'}`} />
            </div>
            <div className="send-options-buttons">
                <ul className="send-options-button-ul">
                    <li className="send-options-button-li">
                        <LuSmilePlus size={25} />
                    </li>
                    <li className="send-options-button-li">
                        {
                            openSelectDocs ? <FaWindowClose onClick={() => setSelectDocs(false)} size={25} /> : <FaPlus onClick={() => setSelectDocs(true)} size={25} />
                        }
                    </li>
                    <li className="send-options-button-li">
                        <button className={`${theme ? 'send' : 'send-dark'}`} style={{ cursor: "pointer" }} onClick={() => sendMessage(message, selectedContact._id)} ><IoMdArrowRoundForward size={25} /></button>
                    </li>
                </ul>
            </div>
        </div>
    )
}

const ChatCard = ({ senderId, message, messageId }) => {
    const { user, theme } = useContext(ChatContext)
    const [openOptions, setOpenOptions] = useState(false)

    return (
        <>
            <div className={`message-single ${user._id === senderId ? 'me' : "you"} `}>
                <div className="user-avatar-div-in-chat">
                    <img src={x} alt="" className="user-avatar-in-chat" />
                </div>
                <div className={`${theme ? "chat-card" : 'chat-card-dark'}`}>
                    {message}
                </div>
                <div className="chats-time">
                    <span className={`${theme ? "chat-time" : 'chat-time-dark'} `}>12:55</span>
                </div>
                <div className="chats-options">
                    <SlOptionsVertical style={{ display: openOptions ? 'none' : 'flex' }} onClick={() => setOpenOptions(true)} size={15} />
                    <MessageOptions senderId={senderId} display={openOptions} msgId={messageId} setDisplay={setOpenOptions} />
                </div>
            </div>
        </>
    )
}

const MessageOptions = ({ display, setDisplay, senderId, msgId }) => {
    const { user, selectedContact, deleteMessage } = useContext(ChatContext)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setOpen(display)
    }, [display])

    return (
        <div className="chat-options-card-item" style={{ display: open ? 'flex' : 'none' }}>
            <div className="chat-options-card-item-div">
                <div className="chat-options-card-item-div-left">
                    <span className="chat-options-card-item-div-left-span">Reply</span>
                </div>
                <div className="chat-options-card-item-div-left">
                    <span className="chat-options-card-item-div-left-span">Forward</span>
                </div>
                <div className="chat-options-card-item-div-left" style={{ display: user._id === senderId ? 'flex' : 'none' }}>
                    <span className="chat-options-card-item-div-left-span" onClick={() => {
                        deleteMessage(msgId, selectedContact._id)
                        setDisplay(false)
                    }}>Delete</span>
                </div>
                <div className="chat-options-card-item-div-left">
                    <span className="chat-options-card-item-div-left-span" onClick={() => setDisplay(false)}>Cancle</span>
                </div>
            </div>
        </div>
    )
}



export {
    ContactsList,
    SearchContactItem,
    ContactItems,
    GroupChatScroll,
    ChatScroll,
    NoUsers,
    NotChat,
    CreateGroupChatModal,
    CreateOneOnOneModal,
    SendOptions,
    ChatCard
}
