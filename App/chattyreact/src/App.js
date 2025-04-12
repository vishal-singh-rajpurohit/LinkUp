import { Route, Routes } from 'react-router-dom';
import Layout from './Layout'
import './App.css';
import './Styles/theme.css'

import Chat from './Components/Chat/Chat';
import {Contacts} from './Components/Chat/Contacts';
import Profile from './Components/Profile/Profile';
import Signup from './Components/Signup/Signup';
import Settings from './Components/Settings/Settings';
import Secure from './Secure/Secure';

function App() {
  return (
    <Routes >
      <Route path='/' element={<Layout />} >
        <Route path='/auth' element={<Signup />} />
        <Route path='/' element={<Secure ><Chat /></Secure>} />
        <Route path='contact' element={<Secure ><Contacts /></Secure>} />
        <Route path='profile' element={<Secure ><Profile /></Secure>} />
        <Route path='settings' element={<Secure><Settings /></Secure>} />
      </Route>
    </Routes>
  );
}

export default App;
