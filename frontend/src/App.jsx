import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { withStore, useStore } from 'react-context-hook';
import Chatbot from '@/components/Chatbot';
import Personality from '@/components/Personality';
import Form from '@/components/Form';
import Coach from '@/components/Coach';
import Diary from '@/components/Diary';
import Login from '@/components/Login';
import logo from '@/assets/images/logo.png';
import './App.css';

function App() {
  const [isLoginVisible, setIsLoginVisible] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [pirateMode, setPirateMode] = useStore("pirateMode")

  return (
    <Router>
      <div className="h-screen flex flex-col">
        {/* Fixed Header */}
        <header className={`fixed top-0 left-0 right-0 z-30 bg-white ${isLoginVisible || isFormVisible ? 'blur-sm' : ''} shadow-md header-bg h-24`}>
          <div className="flex flex-row items-center h-full w-full gap-4 p-4 relative">
            <Link to="/"><img src={logo} alt="Logo" className="w-16 h-16" /></Link>
            <h1 className={`text-[2rem] title-text ${pirateMode ? 'quintessential-regular': ''}`} style={{ backgroundColor: "white" }}>
              {pirateMode ? "sentikelia🏴‍☠️🏴‍☠️🏴‍☠️🏴‍☠️🦜🦜🦜🦜" : "sentikelia"}
            </h1>
            <a className="absolute right-0 top-0 h-full aspect-square bg-[var(--highlight-color)] flex items-center justify-center" 
               href="https://github.com/derivada/sadgpt" 
               target="_blank" 
               rel="noopener noreferrer">
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" 
                   alt="GitHub Logo" 
                   className="w-8 h-8 invert brightness-0"
              />
            </a>
          </div>
        </header>

        {/* Main content area with fixed navbar and scrollable content */}
        <div className="flex flex-1 pt-24"> {/* Add top padding to account for fixed header */}
          {/* Login Form Overlay */}
          {isLoginVisible && (
            <Login setIsFormVisible={setIsFormVisible} setIsLoginVisible={setIsLoginVisible}/>
          )}

          {/* Overlay form */}
          {isFormVisible && (
            <Form setIsFormVisible={setIsFormVisible}/>
          )}

          {/* Fixed Sidebar Navigation */}
          <nav className={`fixed left-0 top-24 bottom-0 w-[200px] bg-gray-100 shadow-md ${(isLoginVisible || isFormVisible) ? 'blur-sm' : ''}`}>
            <ul className="flex flex-col items-start p-4">
              <li className="mb-4">
                <Link to="/" className="link">Chatbot</Link>
              </li>
              <li className="mb-4">
                <Link to="/diary" className="link">Diario</Link>
              </li>
              <li className="mb-4">
                <Link to="/personality" className="link">Personalidad</Link>
              </li>
              <li className="mb-4">
                <Link to="/coach" className="link">Coach</Link>
              </li>
            </ul>
          </nav>

          {/* Scrollable Main Content */}
          <div className={`flex-1 ml-[200px] p-6 overflow-y-auto ${(isLoginVisible || isFormVisible) ? 'blur-sm' : ''}`}>
            <Routes>
              <Route path="/" element={<Chatbot />} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/personality" element={<Personality />} />
              <Route path="/coach" element={<Coach />} />
            </Routes>
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