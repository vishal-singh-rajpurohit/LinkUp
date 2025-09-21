import { Route, Routes } from 'react-router-dom'
import Home from './Components/Home'
import Contacts from './Components/Chat'
import { Account } from './Components/profile/Account'
import Friend from './Components/profile/Friend'
import FindChat from './Components/profile/Pages/FindChat'
import Settings from './Components/profile/Pages/Settings'
import Help from './Components/profile/Pages/Help'
import Auth, { RevAuth } from './middleware/Auth'
import Signup from './Components/Auth/Signup'
import LoginForm from './Components/Auth/Login'
import VideoCallPage from './Components/Calling/VideoCallPage'
function App() {

  return (
    
      <Routes >
        <Route path='/' element={<Auth ><Home /></Auth>} />
        <Route path='/register' element={<RevAuth><Signup /></RevAuth>} />
        <Route path='/login' element={<RevAuth> <LoginForm /></RevAuth>} />
        <Route path='/chat' element={<Auth ><Contacts /></Auth>} />
        <Route path='/chat/details' element={<Auth ><Friend /></Auth>} />
        <Route path='/user' element={<Auth ><Account /></Auth>} />
        <Route path='/user/help' element={<Auth ><Help /></Auth>} />
        <Route path='/user/find-chats' element={<Auth ><FindChat /></Auth>} />
        <Route path='/user/settings' element={<Auth ><Settings /></Auth>} />
        <Route path='/user/call/video' element={<Auth ><VideoCallPage /></Auth>} />
      </Routes>
    
  )
}

export default App
