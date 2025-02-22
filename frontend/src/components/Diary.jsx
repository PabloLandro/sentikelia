import React, { useState } from "react";

function Diary({ toggleDiary }) {
    const [todayText, setTodayText] = useState("")

    return (
        <div className="overlay fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="overlay-content bg-white p-8 rounded-lg">
            <h2 className="text-xl mb-4">Please provide your input:</h2>
            <textarea
              placeholder="Type something here..."
              className="w-96 h-48 p-4 border rounded-md"
            />
            <button
              onClick={toggleDiary}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
    )

}

export default Diary