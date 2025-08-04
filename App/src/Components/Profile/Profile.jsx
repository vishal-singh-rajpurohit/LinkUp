import React, { useContext, useEffect } from 'react'
import '../../Styles/Profile.css'
import '../../Styles/theme.css'
import { FiEdit3 } from 'react-icons/fi'
import { IoMdArrowRoundBack } from 'react-icons/io'
import { MdMarkChatRead } from 'react-icons/md'
import { VscCheckAll } from 'react-icons/vsc'
import ChatContext from '../../context/ChatContext.context'
import { RiCloseLargeLine } from 'react-icons/ri'

import x from '../../Assets/x.png'

const Profile = () => {
    const { editMode, setEditMode, setOpenNav, reactNavigator, theme, user} = useContext(ChatContext);


    useEffect(()=>{
        setOpenNav(false)
    },[])

    const goBack = () =>{
        if(window.innerWidth > 700){
            setOpenNav(true)
            reactNavigator('/')
        }else{
            reactNavigator('/contact')
        }
    }

    return (
        <section className={`${theme? 'Profile-page' : 'Profile-page-dark'}`}>
            {/* <div className="profile-absalute">
                <div className="profile-left">
                    <MdMarkChatRead size={30} />
                </div>
            </div> */}
            <div className="profile-top-edit" >
                <div className="profile-edit-right">
                    <div className="go-back">
                        <IoMdArrowRoundBack onClick={()=>goBack()} size={30} />
                    </div>
                </div>
                <div className="profile-edit-right">
                    <div className="edit-btn">
                        {
                            editMode ? <VscCheckAll size={25} /> : <FiEdit3 onClick={() => setEditMode(true)} size={25} />
                        }
                    </div>
                    {
                        editMode ? <div className="edit-tick"> <RiCloseLargeLine onClick={()=>setEditMode(false)} size={25} />
                        </div> : null
                    }

                </div>
            </div>
            <div className="profile-details-section">
                <div className="profile-details-left">
                    <div className="profile-details-left-inner">
                    <div className="user-name-div">
                        <input type="text" name="" readOnly={!editMode} id={`${!editMode ? "USERNAME" : 'EDIT-ON-USERNAME'}`} placeholder={user.userName} className= {`${ theme ?'input-profile': 'input-profile-dark'} user-name-input`} />
                        <input type="text" name="" readOnly={!editMode} id={`${!editMode ? "SEARCH-CODE" : 'EDIT-ON-SEARCHCODE'}`} placeholder={user.searchTag} className= {`${ theme ?'input-profile': 'input-profile-dark'} user-code-input`} />
                    </div>
                    <div className="user-greet-div">
                        <input type="text" name="" readOnly={!editMode} id={`${!editMode ? "GREET": 'EDIT-ON-GREET'}`} placeholder='hii i am on the app' className= {`${ theme ?'input-profile': 'input-profile-dark'} user-greet-input`} />
                    </div>
                    <div className="profile-page-buttons">
                        <button className={`${theme ? 'profile-page-btn' : 'profile-page-btn-dark'}`}>Make Private</button>
                        <button className={`${theme ? 'profile-page-btn' : 'profile-page-btn-dark'}`}>Avatar</button>
                    </div>
                    </div>
                </div>
                <div className="profile-details-right">
                    <div className="profile-avatar-div">
                        <img src={x} alt="" className={`${theme ? 'profile-Avatar' : 'profile-Avatar-dark'}`} />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Profile