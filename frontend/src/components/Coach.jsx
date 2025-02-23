import { useState, useEffect } from "react";
import api from '@/api'; // Asegúrate de tener esta función de API implementada
import ReloadWheel from '@/components/ReloadWheel';
import { useStore } from "react-context-hook";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { Lightbulb } from "lucide-react";

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
    const [username, setUserName] = useStore("username")
    useEffect(() => {

        const fetchGoals = async () => {
            let data = await api.getObjectives(username)
            setGoals(data["objectives"])
            setPrompt(data["main_objective"])
        }

        fetchGoals()
    },[])
  const toggleGoal = (goalId) => {
    setGoals(goals.map(goal => 
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    ));
    api.toggleGoal(username, goalId)
  };

  const handlePromptSubmit = async () => {

    setIsLoading(true);

    try {
      const response = await api.generateCoachObjectivesAndSuggestions(username, prompt);
      let { newObjectives, newSuggestions, newExplanation } = response;

      setGoals(newObjectives);
      newSuggestions = newSuggestions.map((objective, idx) => ({ id: idx, text: objective, type: "primary" }));
      console.log(newSuggestions)
      setSuggestions(newSuggestions);
      setExplanation(newExplanation);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleReload = async () => {
    
        setIsLoading(true);
    
        try {
            const response = await api.reloadSuggestions(username, goals);
            console.log(response)
            let newSuggestions = response["newSuggestions"].map((objective, idx) => ({ id: idx, text: objective, type: "primary" }));
            setSuggestions(newSuggestions);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

  const handleGenerateQuestion = async () => {
    const question = await api.generar_pregunta_bulb(username);
    console.log("BULB: ", question)
    setPrompt(question["question"]);
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
            {goals && goals.map((goal) => (
                <label
                    key={goal.id} // Unique key for each goal
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-light transition-colors cursor-pointer"
                >
                    <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={() => toggleGoal(goal.id)} // Toggles the goal
                    className="hidden" // Optionally hide the input if you don't want it visible
                    />
                    {goal.completed ? (
                    <CheckCircleIcon className="text-green-500" />
                    ) : (
                    <CircleIcon className="text-gray-500" />
                    )}
                    <span className={goal.completed ? "line-through text-neutral/50" : "text-neutral"}>
                    {goal.text}
                    </span>
                </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-light p-6">
            <div className="flex items-center gap-4 mb-4 justify-betwee">
                <h3 className="text-xl font-semibold text-neutral">Sugerencias</h3>
                <ReloadWheel onClick={handleReload}/>
            </div>
          <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
                key={`${suggestion.id}-${suggestion.type}-${index}`} // Combines id, type, and index for uniqueness
                className={`rounded-lg ${
                suggestion.type === "primary" ? "bg-primary-light" : "bg-neutral-light"
                }`}
            >
                <p
                className={`font-small ${
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
        <div className="flex gap-3 items-center">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Escribe tu objetivo 💪"
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => { handleGenerateQuestion()}} 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generar pregunta</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
