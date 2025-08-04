import React, {useContext } from 'react'
import ChatContext from '../context/ChatContext.context'
import Signup from '../Components/Signup/Signup'

const SafeCall = ({children}) => {
    const {loggedIn, presentCallId} = useContext(ChatContext)
  return (
    <>
        {
            presentCallId&&loggedIn?  children : <Signup /> 
        }
    </>
  )
}

export default SafeCall
