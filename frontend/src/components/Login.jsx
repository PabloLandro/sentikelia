import React, { useState } from "react";

import { useStore } from 'react-context-hook';

import Background from '@/assets/images/background.png'

import api from '@/api';

function Login({ setIsFormVisible, setIsLoginVisible }) {

    const [username, setUsername] = useStore("username")

    const [enteredName, setEnteredName] = useState("")

    const handleLogin = async (e) => {
      setUsername(enteredName)
      console.log("click")
      e.preventDefault();
      let login = await api.login(enteredName);
      console.log(login)
      if (login) {
        setIsFormVisible(false);
      } else {
        setIsFormVisible(true);
      }
      console.log("log")

      setIsLoginVisible(false);
    };

    const handleUsernameChange = (e) => {
      console.log(e.target.value)
      setEnteredName(e.target.value)
    };

    return (
        <div className="login-overlay">
            <div className="login-container" style={{ backgroundImage: `url(${Background})`, 
              backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
              <h2 style={{ color: "white" }} className="text-2xl fix-weight">entra a <span className="title-text">sentikelia</span></h2>
              <form className="login-form" onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="input-field"
                  required
                  onChange={handleUsernameChange}
                />
                <button type="submit" className="button-primary">Login</button>
              </form>
            </div>
          </div>
    )

}

export default Login