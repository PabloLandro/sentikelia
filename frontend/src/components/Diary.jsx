import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import api from '@/api';
import { useStore } from "react-context-hook";
import { useNavigate } from "react-router-dom";


function Diary() {

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [todayText, setTodayText] = useState("");
  const [username, setUsername] = useStore("username")

  useEffect(() => {
    const fetchEntries = async () => {
      const entries = await api.getDiaryEntries(username);
      setEntries(entries);
    };
  
    fetchEntries();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date

  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log(entries)
    if ((formatDate(date) in entries) && ("entry" in entries[formatDate(date)])) {
      setTodayText(entries[formatDate(date)]["entry"]);
    } else {
      setTodayText("");
    }
  };

  const handleTextChange = (event) => {
    setTodayText(event.target.value);
  };

  const closeDiary = () => {
    navigate("/")
  }

  const saveEntry = () => {
    setEntries({
      ...entries,
      [selectedDate]: todayText
    });
    api.addDiaryEntry(username, todayText, formatDate(new Date))
    closeDiary()
  };


  return (
  <div className="">
    <h2 className="text-2xl font-bold mb-6 text-center title-text">Tu diario personal</h2>
    <div className="flex flex-col items-center mb-4">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        className="mb-2 border rounded-lg" // smaller calendar
      />
      <p className="text-xs text-gray-600 italic mt-3">
        View past entries (read-only).
      </p>
    </div>
    <textarea
      placeholder={
        selectedDate.toDateString() === today.toDateString()
          ? "¿Cómo te ha ido hoy?"
          : "No hay entradas para este día"
      }
      value={todayText}
      onChange={handleTextChange}
      className="flex-grow w-full p-4 border rounded-md diary-bg placeholder-gray-500 resize-none"
      disabled={selectedDate.toDateString() !== today.toDateString()}
    />
    <div className="flex justify-end mt-4">
      <button
        onClick={saveEntry}
        className={`px-4 py-2 rounded-lg mr-2 ${
          selectedDate.toDateString() === today.toDateString()
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        disabled={selectedDate.toDateString() !== today.toDateString()}
      >
        Escribir
      </button>
      <button
        onClick={closeDiary}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Cerrar
      </button>
    </div>
  </div>

  );
}

export default Diary;