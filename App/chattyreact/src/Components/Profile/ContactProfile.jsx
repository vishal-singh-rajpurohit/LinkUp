import React, { useContext } from 'react'
import '../../Styles/ContactProfile.css'
import x from '../../Assets/x.png'
import { IoMdArrowRoundBack, IoMdShare } from 'react-icons/io'
import { MdBlock } from 'react-icons/md'
import ChatContext from '../../context/ChatContext.context'
import {ContactsList} from '../Minors/ContactsList'

const ContactProfile = () => {
    const {openProfile, setOpenProfile} = useContext(ChatContext)
  return (
    <section className="contact-profile-page" style={{display: openProfile ? 'flex' : 'none'}}>
        <div className="contact-profile-top">
            <div className="contact-profile-top-left">
                <IoMdArrowRoundBack onClick={()=>setOpenProfile(false)} size={25} />
            </div>
            <div className="contact-profile-top-right">
                <IoMdShare size={25} />
                <MdBlock size={25} />
            </div>
        </div>
        <div className="contact-profile-details">
            <div className="cntact-profile-details-text">
                <p className="contact-profile-details-name">Lionardo Da Vinchi</p>
                <p className="contact-profile-details-searchTag">Leonardo_Da_@Vinchi</p>
            </div>
            <div className="contact-profile-details-Avatar-div">
                <div className="contact-profile-details-Avatar-div-child">
                    <img src={x} alt="" className="contact-Avatar-Img" />
                </div>
            </div>
        </div>
        <ContactsList />
    </section>
  )
}

export default ContactProfile