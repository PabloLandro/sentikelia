import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import api from '@/api';
import { useStore } from "react-context-hook";

function Diary({ toggleDiary }) {

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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

  const saveEntry = () => {
    setEntries({
      ...entries,
      [selectedDate]: todayText
    });
    api.addDiaryEntry(username, todayText, formatDate(new Date))
    toggleDiary()
  };

  return (
    <div className="overlay fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50 diary-bg">
      <div className="overlay-content bg-white p-8 rounded-lg">
        <h2 className="text-xl mb-4">Please provide your input:</h2>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          className="mb-4"
        />
        <textarea
          placeholder="Type something here..."
          value={todayText}
          onChange={handleTextChange}
          className="w-96 h-48 p-4 border rounded-md"
        />
        <button
          onClick={saveEntry}
          className={`mt-4 px-4 py-2 rounded-lg mr-2 ${
            selectedDate.toDateString() === today.toDateString()
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={selectedDate.toDateString() !== today.toDateString()}
        >
          Save
        </button>
        <button
          onClick={toggleDiary}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Diary;