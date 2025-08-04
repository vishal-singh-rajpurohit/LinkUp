import React, { useContext } from 'react'
import {FaVideo} from 'react-icons/fa'
import "../../Styles/Minros/media-modal.css"
import ChatContext from '../../context/ChatContext.context'

const SelectMedia = () => {

    const {openSelectDocs} = useContext(ChatContext);

  return (
    <section className="select-media-section" style={{display: openSelectDocs? 'flex' : 'none'}}>
        <div className="select-media-grid-div">
            <div className="media-component">
                <FaVideo size={25}/>
                <span className="media-type-title">document</span>
            </div>
            <div className="media-component">
                <FaVideo size={25}/>
                <span className="media-type-title">document</span>
            </div>
            <div className="media-component">
                <FaVideo size={25}/>
                <span className="media-type-title">document</span>
            </div>
            <div className="media-component">
                <FaVideo size={25} />
                <span className="media-type-title">document</span>
            </div>
        </div>
    </section>
  )
}

export default SelectMedia
