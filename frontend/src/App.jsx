import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { withStore, useStore } from 'react-context-hook';
import Chatbot from '@/components/Chatbot';
import Personality from '@/components/Personality';
import Form from '@/components/Form';
import Diary from '@/components/Diary';
import Login from '@/components/Login';
import logo from '@/assets/images/logo.png';
import Background from '@/assets/images/background.png'
import './App.css'; // Include the CSS file for styling

function App() {
  const [isLoginVisible, setIsLoginVisible] = useState(true); // Track visibility of login screen
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [username, setUsername] = useStore("username")
  const [pirateMode, setPirateMode] = useStore("pirateMode")

  return (
    <Router>
      <div className="relative flex flex-col">
        {/* Header Section */}
        <header className={`sticky top-0 shrink-0 z-20 bg-white ${isLoginVisible || isFormVisible ? 'blur-sm' : ''} shadow-md header-bg`}>
          <div className="flex flex-row items-center h-full w-full gap-4 p-4 relative">
            <img src={logo} alt="Logo" className="w-16 h-16" />
            <h1 className={`text-[2rem] title-text ${pirateMode ? 'quintessential-regular': ''}`} style={{ backgroundColor: "white" }}>{pirateMode ? "sentikelia🏴‍☠️🏴‍☠️🏴‍☠️🏴‍☠️🦜🦜🦜🦜" : "sentikelia"}</h1>
            {/* GitHub Icon Container */}
              <a className="absolute right-0 top-0 h-full aspect-square bg-[var(--highlight-color)] flex items-center justify-center" href="https://github.com/derivada/sadgpt" target="_blank" rel="noopener noreferrer">
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" 
                  alt="GitHub Logo" 
                  className="w-8 h-8 invert brightness-0"
                />
              </a>
          </div>
        </header>

        <div className="relative flex flex-row min-h-screen w-full">
    

          {/* Login Form Overlay */}
          {isLoginVisible && (
            <Login setIsFormVisible={setIsFormVisible} setIsLoginVisible={setIsLoginVisible}/>
          )}

          {/* Overlay form */}
          {isFormVisible && (
            <Form setIsFormVisible={setIsFormVisible}/>
          )}

          {/* Tabs */}
          <div className={`sticky tabs h-full ${(isLoginVisible || isFormVisible) ? 'blur-sm' : ''} flex w-full`}>
            {/* Sidebar Navigation */}
            <nav className="sticky min-w-[200px] bg-gray-100 h-screen shadow-md" style={{ width: "350px", margin: "0"}}>
{/*             <h2 className="pl-4 pt-4 ml-4 text-xl font-thin m-0">
              Hola <span className="font-black">{username}</span>
            </h2> */}
              <ul className="flex flex-col items-start p-4">
                  <li className="mb-4">
                    <Link
                      to="/"
                      className="link"
                    >
                      Chatbot
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link
                      to="/diary"
                      className="link"
                    >
                      Diario
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link
                      to="/personality"
                      className="link"
                    >
                      Personalidad
                    </Link>
                  </li>
              </ul>
            </nav>

            {/* Main Content */}
            <div className="flex-grow p-6">
              {/* Define Routes */}
              <Routes>
                <Route path="/" element={<Chatbot />} />
                <Route path="/diary" element={<Diary />} />
                <Route path="/personality" element={<Personality />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

const initialState = {
  username: "",
  pirateMode: false
};

export default withStore(App, initialState);