import React, { useState } from "react"

import api from '@/api';

function Form({ setIsFormVisible }) {

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

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = formData;
        data["characteristics"] = Object.keys(characteristics).filter(key => characteristics[key]);
        setIsFormVisible(false); // Hide the form after submission
        console.log("Form Data being sent:", data);
        api.submitForm(username, data);
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

    return (
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
                <button type="submit" className="button-primary">
                  Enviar
                </button>
              </form>
            </div>
          </div>
    )

}

export default Form