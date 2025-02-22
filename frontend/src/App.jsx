import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { withStore, useStore } from 'react-context-hook';
import Chatbot from '@/components/Chatbot';
import Personality from '@/components/Personality';
import Form from '@/components/Form';
import Diary from '@/components/Diary';
import Login from '@/components/Login';
import logo from '@/assets/images/logo.png';
import './App.css'; // Include the CSS file for styling

function App() {
  const [isLoginVisible, setIsLoginVisible] = useState(false); // Track visibility of login screen
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <Router>
      <div className="relative flex flex-col">
        {/* Header Section */}
        <header
          className={`sticky top-0 shrink-0 z-20 bg-white ${(isLoginVisible || isFormVisible) ? 'blur-sm' : ''} shadow-md`}
        >
          <div className="flex flex-row items-center h-full w-full gap-4 p-4">
            <img src={logo} alt="Logo" className="w-16 h-16" />
            <h1 className="text-[2rem] title-text">sentikelia</h1>
          </div>
        </header>
        <div className="relative flex flex-row min-h-screen w-full">
          

          {/* Login Form Overlay */}
          {isLoginVisible && (
            <Login setIsFormVisible={setIsFormVisible} setIsLoginVisible={setIsLoginVisible}/>
          )}

          {/* Overlay form */}
          {isFormVisible && (
            <Form setIsFormVisible/>
          )}

          {/* Tabs */}
          <div className={`tabs ${(isLoginVisible || isFormVisible) ? 'blur-sm' : ''} flex w-full`}>
            {/* Sidebar Navigation */}
            <nav className="w-1/4 min-w-[200px] bg-gray-100 h-screen shadow-md">
              <ul className="flex flex-col items-start p-4">
                  <li className="mb-4">
                    <Link
                      to="/personality"
                      className="link"
                    >
                      Personality
                    </Link>
                  </li>
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
                      Diary
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
  username: "Pablo Barba Negra",
};

export default withStore(App, initialState);