import React, { useState } from 'react';

import { withStore, useStore } from 'react-context-hook'


import Chatbot from '@/components/Chatbot';
import Diary from '@/components/Diary';
import logo from '@/assets/images/logo.png';
import diary_icon from '@/assets/images/diary.png';
import api from '@/api';
import './App.css'; // Include the CSS file for styling

function App() {
  const [isLoginVisible, setIsLoginVisible] = useState(true); // Track visibility of login screen
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isDiaryVisible, setIsDiaryVisible] = useState(false)
  const [username, setUsername] = useStore("username")

  const [formData, setFormData] = React.useState({
    age: "",
    mood: "",
    important_context: "",
    chat_tone: "formal", // default value
  });

  const [characteristics, setCharacteristics] = useState({
    introvertido: false,
    extrovertido: false,
    analítico: false,
    creativo: false,
    empático: false,
    organizado: false,
  });

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault()
    let login = await api.login(username)
    if (login) {
      setIsFormVisible(false)
    } else {
      setIsFormVisible(true)
    }
    setIsLoginVisible(false)

  };

  // Handlers for input changes
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleCheckboxChange(e) {
    const { name, checked } = e.target;
    setCharacteristics({ ...characteristics, [name]: checked });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = formData
    data["characteristics"] = Object.keys(characteristics).filter(key => characteristics[key]);
    setIsFormVisible(false); // Hide the form after submission
    api.submitForm(username, data)
  };

  const toggleDiary = () => {
    setIsDiaryVisible((prevState) => !prevState)
  }

  return (
    <div className="relative flex flex-col min-h-full w-full max-w-3xl mx-auto px-4">
      {/* Header Section */}
      <header className="sticky top-0 shrink-0 z-20 bg-white">
        <div className="flex flex-row items-center h-full w-full gap-4 pt-4 pb-2">
          <img
            src={logo}
            alt="Logo"
            className="w-16 h-16"
          />
          <h1 className="sour-gummy-400 text-[2rem] font-semibold">SadGPT</h1>
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
            <h2 className="text-xl font-semibold text-[2rem] sour-gummy-100">Entra a SadGPT 😊</h2>
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
      )}

      {/* Overlay form */}
      {isFormVisible && (
        <div className="overlay">
        <div className="form-container">
          <h2>Bienvenido {username}, cuéntanos más sobre ti</h2>
          <form onSubmit={handleSubmit} className="personality-form">
            {/* Age Field */}
            <label>
              Edad:
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </label>
      
            {/* Mood Field */}
            <label>
              ¿Cómo te sientes?:
              <input
                type="text"
                name="mood"
                value={formData.mood}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., Contento, cansado, motivado"
              />
            </label>
      
            {/* Important Context Field */}
            <label>
              Contexto Importante:
              <textarea
                name="important_context"
                value={formData.important_context}
                onChange={handleInputChange}
                className="textarea-field"
                placeholder="Cuéntanos algo importante sobre ti"
              />
            </label>
      
            {/* Chat Tone Dropdown */}
            <label>
              Tono de Chat:
              <select
                name="chat_tone"
                value={formData.chat_tone}
                onChange={handleInputChange}
                className="dropdown-field"
              >
                <option value="0">Neutral</option>
                <option value="1">Motivacional</option>
                <option value="2">Tranquilizador</option>
                <option value="3">Directo</option>
                <option value="4">Amigo pirata</option>
              </select>
            </label>
      
            {/* Characteristics (Checkboxes) */}
            <fieldset>
              <legend>Características:</legend>
              {Object.keys(characteristics).map((trait) => (
                <label key={trait}>
                  <input
                    type="checkbox"
                    name={trait}
                    checked={characteristics[trait]}
                    onChange={handleCheckboxChange}
                  />
                  {trait.charAt(0).toUpperCase() + trait.slice(1)}
                </label>
              ))}
            </fieldset>
      
            {/* Submit Button */}
            <button type="submit" className="submit-button">
              Enviar
            </button>
          </form>
        </div>
      </div>
      
      )}

      {/* Diary */}

      {isDiaryVisible && (
        <Diary toggleDiary={toggleDiary}/>
      )}

      <button onClick={toggleDiary} className="absolute bottom-8 right-8 w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg">
        <img src={diary_icon} alt="icon" className="w-8 h-8" />
      </button>

    </div>
  );
}

const initialState = {
  username: null,
}

export default withStore(App, initialState);