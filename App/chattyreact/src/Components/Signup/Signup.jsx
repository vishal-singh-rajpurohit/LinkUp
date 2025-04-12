import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import '../../Styles/Login.css'
import ChatContext from '../../context/ChatContext.context'



const Signup = () => {
  const { setLoggedIn, setUser, getChatHistory } = useContext(ChatContext)
  useEffect(() => {
    setOpenNav(false);
  }, [])

  const { setOpenNav } = useContext(ChatContext);
  const [newUser, setNewUser] = useState(false);

  // FORM DATA react states
  const [formData, setFormData] = useState({
    searchTag: "",
    password: "",
    conformpass: "",
    userName: "",
    email: ""
  })


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const login = async (e) => {
    e.preventDefault();

    const registerFormData = new FormData();
    registerFormData.append("searchTag", formData.searchTag)
    registerFormData.append("password", formData.password)

    try {
      const response = await axios.post(`${process.env.REACT_APP_CHAT_API}/user/login`,
        registerFormData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        })
      setLoggedIn(true)
      console.log("response ", response)
      setUser(response.data.data.User)
      localStorage.setItem("accessToken", response.data.data.accessToken);
      getChatHistory()
    } catch (error) {
      // console.log("Error in login user ", error)
    }
  }

  const register = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.conformpass) {
      console.error("password does not matching")
      return;
    }

    const registerFormData = new FormData()
    registerFormData.append("email", formData.email)
    registerFormData.append("searchTag", formData.searchTag)
    registerFormData.append("userName", formData.userName)
    registerFormData.append("password", formData.password)

    try {
      const response = await axios.post(`${process.env.REACT_APP_CHAT_API}/user/register`,
        registerFormData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        })
      setLoggedIn(true)
      setUser(response.data.data.User)
      localStorage.setItem("accessToken", response.data.data.accessToken);
      getChatHistory()
    } catch (error) {

    }
  }

  return (
    <section className="login-page">
      <section className="login-card">
        <div className="Login-top">
          <button className="login-button" id={`${newUser ? '' : 'active-log'}`} onClick={() => setNewUser(false)}>Login</button>
          <button className="login-button" id={`${newUser ? 'active-log' : ''}`} onClick={() => setNewUser(true)}>Signup</button>
        </div>
        {
          newUser ?
            <form className="login-card-inputs" onSubmit={register}>
              <div className="login-card-inputs-double">
                <input type="text" onChange={handleChange} name='userName' placeholder='your name' className="input-halfs" />
                <input type="text" onChange={handleChange} name='searchTag' placeholder='your tag' className="input-halfs" />
              </div>
              <div className="login-card-inputs-single">
                <input type="email" onChange={handleChange} name='email' placeholder='iam@mail.com' id="" className="input-full" />
              </div>
              <div className="login-card-inputs-double">
                <input type="password" onChange={handleChange} name='password' placeholder='Password' className="input-halfs" />
                <input type="password" onChange={handleChange} name='conformpass' placeholder='Conform Password' className="input-halfs" />
              </div>
              <div className="final-button">
                <button className="submit-buttons" type='submit'>register</button>
              </div>
            </form>
            :
            <form className="login-card-inputs" onSubmit={login}>
              <div className="login-card-inputs-single">
                <input type="text" name="searchTag" onChange={handleChange} placeholder='your tag or email' id="searchTag" className="input-full" />
              </div>
              <div className="login-card-inputs-single">
                <input type="password" name="password" autoComplete="current-password" onChange={handleChange} placeholder='Password' id="password" className="input-full" />
              </div>
              <div className="final-button">
                <button className="submit-buttons">login</button>
              </div>
            </form>
        }

      </section>
    </section>
  )
}

export default Signup