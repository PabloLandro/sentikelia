import { useState } from "react";
import api from '@/api'; // Asegúrate de tener esta función de API implementada
import ReloadWheel from '@/components/ReloadWheel';
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-primary"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-neutral/30"
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const initialGoals = [
  { id: 1, text: "Meditar 10 minutos", completed: false },
  { id: 2, text: "Hacer ejercicio", completed: false },
  { id: 3, text: "Leer un libro", completed: false },
];

const initialSuggestions = [
  {
    id: 1,
    text: "Toma un descanso de 5 minutos para practicar respiración consciente",
    type: "primary",
  },
  {
    id: 2,
    text: "Recuerda mantenerte hidratado durante el día",
    type: "neutral",
  },
];

function Coach() {
  const [prompt, setPrompt] = useState("");
  const [goals, setGoals] = useState(initialGoals);
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleGoal = (goalId) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const showToast = (title, description, variant = "default") => {
    alert(`${title}\n${description}`);
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) {
      showToast(
        "El campo no puede estar vacío",
        "Por favor, escribe tu objetivo",
        "destructive"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(prompt);
      const { newGoals, newSuggestions, newExplanation } = response;

      setGoals(newGoals);
      setSuggestions(newSuggestions);
      setExplanation(newExplanation);
      setPrompt("");

      showToast(
        "Objetivos actualizados",
        "He personalizado tus objetivos según tus necesidades"
      );
    } catch (error) {
      console.error(error);
      showToast(
        "Error",
        "Hubo un problema al procesar tu solicitud",
        "destructive"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-left title-text">Coach de Bienestar</h2>
        <p className="text-neutral/70">Alcanza tus objetivos de bienestar personal</p>
      </div>

      {explanation && (
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-light p-6">
            <h3 className="text-xl font-semibold text-neutral mb-4">Análisis Personalizado</h3>
            <p className="text-neutral/80 leading-relaxed">{explanation}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-light p-6">
          <h3 className="text-xl font-semibold text-neutral mb-4">Objetivos Diarios</h3>
          <div className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-light transition-colors cursor-pointer"
                onClick={() => toggleGoal(goal.id)}
              >
                {goal.completed ? (
                  <CheckCircleIcon />
                ) : (
                  <CircleIcon />
                )}
                <span className={goal.completed ? "line-through text-neutral/50" : "text-neutral"}>
                  {goal.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-light p-6">
            <div className="flex items-center gap-4 mb-4">
                <h3 className="text-xl font-semibold text-neutral">Sugerencias</h3>
                <ReloadWheel />
            </div>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg ${
                  suggestion.type === "primary" ? "bg-primary-light" : "bg-neutral-light"
                }`}
              >
                <p
                  className={`font-medium ${
                    suggestion.type === "primary" ? "text-primary" : "text-neutral"
                  }`}
                >
                  {suggestion.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-light p-6">
        <h3 className="text-xl font-semibold text-neutral mb-4">¿Qué objetivo te gustaría alcanzar?</h3>
        <div className="flex gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Escribe tu objetivo 💪"
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
          <button 
            onClick={handlePromptSubmit} 
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {isLoading ? "Analizando..." : "Enviar"}
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coach;
