import React, { useContext } from 'react'
import '../../Styles/ContactProfile.css'
import x from '../../Assets/x.png'
import { IoMdArrowRoundBack, IoMdShare } from 'react-icons/io'
import { MdBlock, MdSecurity, MdDeleteSweep } from "react-icons/md";
import ChatContext from '../../context/ChatContext.context'
import { ContactsList } from '../Minors/ContactsList'

const ContactProfile = () => {
    const { openProfile, setOpenProfile, selectedContact } = useContext(ChatContext)
    return (
        <section className="contact-profile-page" style={{ display: openProfile ? 'flex' : 'none' }}>
            <div className="contact-profile-top">
                <div className="contact-profile-top-left">
                    <IoMdArrowRoundBack onClick={() => setOpenProfile(false)} size={25} />
                </div>
                <div className="contact-profile-top-right">
                    <IoMdShare size={25} />
                    <MdBlock size={25} />
                </div>
            </div>

            <div className="contact-profile-details">
                <div className="cntact-profile-details-text">
                    <p className="contact-profile-details-name">{selectedContact.userName}</p>
                    <p className="contact-profile-details-searchTag">{selectedContact.searchTag || null}</p>
                </div>
                <div className="contact-profile-details-Avatar-div">
                    <div className="contact-profile-details-Avatar-div-child">
                        <img src={x} alt="" className="contact-Avatar-Img" />
                    </div>
                </div>
            </div>
            <div className="contact-profile-details-options-div">
                <MdBlock size={25} />
                <MdSecurity size={25} />
                <MdDeleteSweep size={25} />
            </div>
            {
                selectedContact.searchTag === "group" ?
                    <ContactsList />
                    : null
            }
        </section>
    )
}

export default ContactProfile