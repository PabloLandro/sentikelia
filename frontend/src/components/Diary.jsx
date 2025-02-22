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
    // api.modifyImportantContext(username, todayText)
    closeDiary()
  };


  return (
    <div className="min-h-screen flex flex-col h-full w-full">
      <h2 className="text-2xl font-bold py-4 text-left title-text">Tu diario personal</h2>
      
      <div className="flex gap-6">
        {/* Left side - Textarea */}
        <div className="flex-grow">
          <textarea
            placeholder={
              selectedDate.toDateString() === today.toDateString()
                ? "¿Cómo te ha ido hoy?"
                : "No hay entradas para este día"
            }
            value={todayText}
            onChange={handleTextChange}
            className="w-full h-full p-4 pl-5 border rounded-lg diary-bg placeholder-gray-500 resize-none"
            disabled={selectedDate.toDateString() !== today.toDateString()}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={saveEntry}
              className={`px-4 py-2 rounded-lg ${
                selectedDate.toDateString() === today.toDateString()
                  ? "button-primary"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={selectedDate.toDateString() !== today.toDateString()}
            >
              Escribir
            </button>
          </div>
        </div>

        {/* Right side - Calendar */}
        <div className="w-64">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            className="border rounded-lg w-full"
          />
          <p className="text-xs text-gray-600 italic mt-3 text-center">
            Ver entradas de diario pasado (solo lectura).
          </p>
        </div>
      </div>
    </div>

  );
}

export default Diary;