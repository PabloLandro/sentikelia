import { useState } from 'react';
import { useImmer } from 'use-immer';
import api from '@/api';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';

function Chatbot() {
  const [messages, setMessages] = useImmer([]);
  const [newMessage, setNewMessage] = useState('');

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
      const assistantMessage = await api.sendChatMessage(trimmedMessage);

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

  console.log(messages)

  return (
    <div className='relative grow flex flex-col gap-6 pt-6'>
      {messages.length === 0 && (
        <div className='mt-3 font-urbanist text-primary-blue text-xl font-light space-y-2'>
          <p>😔 ¡Hola! Bienvenido a SadGPT.</p>
          <p>📖 Soy tu compañero para escribir y reflexionar sobre tu día.</p>
          <p>💭 Puedes contarme cómo te sientes, y yo analizaré tus emociones para ayudarte a entender mejor tu estado de ánimo.</p>
          <p>📊 Además, puedo hacer un pequeño análisis de sentimiento para que veas la evolución de tu diario.</p>
          <p>📝 Escribe cuando quieras, estoy aquí para escucharte.</p>
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
