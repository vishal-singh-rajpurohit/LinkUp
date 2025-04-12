import React, {useContext } from 'react'
import ChatContext from '../context/ChatContext.context'
import Signup from '../Components/Signup/Signup'

const Secure = ({children}) => {
    const {loggedIn} = useContext(ChatContext)
  return (
    <>
        {
            loggedIn?  children : <Signup /> 
        }
    </>
  )
}

export default Secure
