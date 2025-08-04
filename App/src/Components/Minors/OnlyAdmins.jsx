import React, { useContext } from 'react'
import '../../Styles/SmallComponents.css'
import ChatContext from '../../context/ChatContext.context'

const OnlyAdmins = () => {
  const {canMessageInChat} = useContext(ChatContext);
  return (
    <section className="only-admins-section" style={{display: canMessageInChat? 'none' : 'flex'}} >
        <div className="admins-section">
            <span className="only-admins-can-send">
                only admins can send messages 
            </span>
        </div>
    </section>
  )
}

export default OnlyAdmins
