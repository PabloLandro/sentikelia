import React from "react";

import { useStore } from 'react-context-hook';

import api from '@/api';

function Login({ setIsFormVisible, setIsLoginVisible }) {

    const [username, setUsername] = useStore("username")

    const handleLogin = async (e) => {
      console.log("click")
      e.preventDefault();
      let login = await api.login(username);
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
      setUsername(e.target.value);
    };

    return (
        <div className="login-overlay">
            <div className="login-container">
              <h2 className="text-xl fix-weight">entra a <span className="title-text">sentikelia</span> 😊</h2>
              <form className="login-form" onSubmit={handleLogin}>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="input-field"
                  required
                  onChange={handleUsernameChange}
                />
                <button type="submit" className="login-button">Login</button>
              </form>
            </div>
          </div>
    )

}

export default Login