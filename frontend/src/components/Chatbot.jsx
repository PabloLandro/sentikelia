import { useState } from 'react';
import { useStore } from 'react-context-hook'


import { useImmer } from 'use-immer';
import api from '@/api';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';

function Chatbot() {
  const [messages, setMessages] = useImmer([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useStore("username")

  const isLoading = messages.length && messages[messages.length - 1].loading;

  async function submitNewMessage() {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages(draft => [
      ...draft,
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: '', loading: true }
    ]);
    setNewMessage('');

    try {

      // Get the full response instead of a stream
      const assistantMessage = await api.sendChatMessage(trimmedMessage, username);

      setMessages(draft => {
        draft[draft.length - 1].content = assistantMessage;  // Full response
        draft[draft.length - 1].loading = false;
      });
    } catch (err) {
      console.log(err);
      setMessages(draft => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = true;
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col h-full w-full">
      {messages.length === 0 && (
        <div className='mt-3 cursive-font text-xl font-light space-y-2'>
          <p>¡Hola <span style={{ fontWeight: "bold" }}>{username}</span>! Bienvenido a <span className="title-text">sentikelia</span>.</p>
          <p>Soy tu compañero para escribir y reflexionar sobre tu día.</p>
          <p>También puedo recordarte tus metas y ayudarte a mantenerte enfocado.</p>
          <p>En la pestaña de <span className="title-text">Diario</span> para empezar a escribir tu diario virtual, que yo recordaré.</p>
          <p>Además, puedo hacer un pequeño análisis de <span className="title-text">Personalidad</span>.</p>
          <p>Escribe cuando quieras, estoy aquí para escucharte.</p>
        </div>
      )}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
      />
      <ChatInput
        newMessage={newMessage}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />
    </div>
  );
}

export default Chatbot;
