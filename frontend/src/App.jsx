import React, { useState } from 'react';
import Chatbot from '@/components/Chatbot';
import logo from '@/assets/images/logo.png';
import api from '@/api';
import './App.css'; // Include the CSS file for styling

function App() {
  const [isLoginVisible, setIsLoginVisible] = useState(true); // Track visibility of login screen
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [username, setUsername] = useState("")
  const [personalityTraits, setPersonalityTraits] = useState({
    introverted: false,
    extroverted: false,
    analytical: false,
    creative: false,
    empathetic: false,
    organized: false,
  });

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleLogin = (e) => {
    e.preventDefault()
    let login = api.login(username)
    if (login) {
      setIsFormVisible(false)
    } else {
      setIsFormVisible(true)
    }
    setIsLoginVisible(false)

  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setPersonalityTraits((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("User's personality traits:", personalityTraits);
    setIsFormVisible(false); // Hide the form after submission
  };


  return (
    <div className="relative flex flex-col min-h-full w-full max-w-3xl mx-auto px-4">
      {/* Header Section */}
      <header className="sticky top-0 shrink-0 z-20 bg-white">
        <div className="flex flex-col h-full w-full gap-1 pt-4 pb-2">
          <h1 className="font-urbanist text-[2rem] font-semibold">SadGPT</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className={`transition-all ${(isLoginVisible || isFormVisible) ? 'blur-sm' : ''}`}>
        <Chatbot />
      </div>

      {/* Login Form Overlay */}
      {isLoginVisible && (
        <div className="login-overlay">
          <div className="login-container">
            <h2 className="text-xl font-semibold">Entra a SadGPT 😊</h2>
            <form className="login-form" onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="Username"
                className="input-field"
                required
                onChange={handleUsernameChange}
              />
              <button type="submit" className="login-button">Login</button>
            </form>
          </div>
        </div>
      )}

      {/* Overlay form */}
      {isFormVisible && (
        <div className="overlay">
          <div className="form-container">
            <h2>Tell us about your personality</h2>
            <form onSubmit={handleSubmit} className="personality-form">
              <label>
                <input
                  type="checkbox"
                  name="introverted"
                  checked={personalityTraits.introverted}
                  onChange={handleCheckboxChange}
                />
                Introverted
              </label>
              <label>
                <input
                  type="checkbox"
                  name="extroverted"
                  checked={personalityTraits.extroverted}
                  onChange={handleCheckboxChange}
                />
                Extroverted
              </label>
              <label>
                <input
                  type="checkbox"
                  name="analytical"
                  checked={personalityTraits.analytical}
                  onChange={handleCheckboxChange}
                />
                Analytical
              </label>
              <label>
                <input
                  type="checkbox"
                  name="creative"
                  checked={personalityTraits.creative}
                  onChange={handleCheckboxChange}
                />
                Creative
              </label>
              <label>
                <input
                  type="checkbox"
                  name="empathetic"
                  checked={personalityTraits.empathetic}
                  onChange={handleCheckboxChange}
                />
                Empathetic
              </label>
              <label>
                <input
                  type="checkbox"
                  name="organized"
                  checked={personalityTraits.organized}
                  onChange={handleCheckboxChange}
                />
                Organized
              </label>
              <button type="submit" className="submit-button">
                Submit
              </button>
            </form>
            <button
              onClick={() => setIsFormVisible(false)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;