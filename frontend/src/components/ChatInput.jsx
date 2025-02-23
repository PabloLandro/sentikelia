import React, { useState, useEffect } from "react"

import api from '@/api';

import { useStore } from 'react-context-hook'


import useAutosize from '@/hooks/useAutosize';
import sendIcon from '@/assets/images/send.svg';

const tonalidades = [
  { id: -1, label: "⚙️ Auto " },
  { id: 0, label: "🙂 Neutral " },
  { id: 1, label: "💪 Motivacional " },
  { id: 2, label: "😌 Tranquilizador " },
  { id: 3, label: "🎯 Directo " },
  { id: 4, label: "🏴‍☠️ Amigo pirata " }
];

function ChatInput({ newMessage, isLoading, setNewMessage, submitNewMessage }) {
  const textareaRef = useAutosize(newMessage);
  const [selectedTone, setSelectedTone] = useState(tonalidades[0].id);
  const [username, setUsername] = useStore("username")
  const [pirateMode, setPirateMode] = useStore("pirateMode")

  useEffect(() => {
    if (username == null) {
      return
    }
    const fetchTone = async () => {
      console.log(username)
      let tone = await api.getTone(username)
      setSelectedTone(tone)
      if(tone == 4) setPirateMode(true)
      else setPirateMode(false)
    };
    fetchTone();
  },[username])

  function handleKeyDown(e) {
    if(e.keyCode === 13 && !e.shiftKey && !isLoading) {
      e.preventDefault();
      submitNewMessage();
    }
  }

  function handleToneChange(event) {
    let tone = Number(event.target.value)
    setSelectedTone(tone)
    api.setTone(username, tone)
    if(tone == 4) setPirateMode(true)
    else setPirateMode(false)
  }
  
  return(
    <div className='sticky bottom-0 bg-white py-4'>
      <div className='p-1.5 bg-primary-blue/35 rounded-3xl z-50 origin-bottom animate-chat duration-400'>
        <div className='flex items-center relative bg-white rounded-3xl overflow-hidden ring-primary-blue ring-1 focus-within:ring-2 transition-all'>
          {/* Dropdown for chatbot personality */}
          <select
            className='w-36 bg-transparent border-r border-gray-300 text-sm outline-none px-2 py-1'
            value={selectedTone}
            onChange={handleToneChange}
          >
            {tonalidades.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          {/* Chat text input */}
          <textarea
            className='flex-grow block max-h-[140px] py-2 px-4 pr-11 bg-white resize-none placeholder:text-primary-blue placeholder:leading-4 focus:outline-none'
            ref={textareaRef}
            rows='1'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {/* Send button */}
          <button
            className='absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-md'
            onClick={submitNewMessage}
          >
            <img src={sendIcon} alt='send' />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;