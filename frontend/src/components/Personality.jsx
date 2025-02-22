import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import api from '@/api';

// Subcomponent for the personality charts
const PersonalityCharts = ({ personalityResults }) => {
  // Transform Big Five data for RadarChart
  const big5Data = [
    {
      trait: "Openness",
      value: personalityResults.big5_result.Openness * 100
    },
    {
      trait: "Conscientiousness",
      value: personalityResults.big5_result.Conscientiousness * 100
    },
    {
      trait: "Extraversion",
      value: personalityResults.big5_result.Extraversion * 100
    },
    {
      trait: "Agreeableness",
      value: personalityResults.big5_result.Agreeableness * 100
    },
    {
      trait: "Neuroticism",
      value: personalityResults.big5_result.Neuroticism * 100
    }
  ];

  // Enneagram circle positions
  const radius = 150;
  const center = { x: 200, y: 200 };
  const points = [];
  const enneagramTypes = Object.entries(personalityResults.enneagram_result);
  
  // Calculate positions for Enneagram types in a circle
  for (let i = 0; i < 9; i++) {
    const angle = (i * 40) * (Math.PI / 180) - Math.PI / 2;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
      type: enneagramTypes[i][0],
      value: enneagramTypes[i][1]
    });
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-4 text-center">Big Five Personality Traits</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={big5Data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="trait" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="Personality"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-4 text-center">Enneagram Profile</h3>
        <div className="relative h-96">
          <svg width="400" height="400" className="mx-auto">
            {/* Draw connecting lines */}
            <path
              d={`M${points[0].x},${points[0].y} 
                   L${points[3].x},${points[3].y} 
                   L${points[6].x},${points[6].y} 
                   L${points[1].x},${points[1].y} 
                   L${points[4].x},${points[4].y} 
                   L${points[7].x},${points[7].y} 
                   L${points[2].x},${points[2].y} 
                   L${points[5].x},${points[5].y} 
                   L${points[8].x},${points[8].y} 
                   L${points[0].x},${points[0].y}`}
              stroke="#ddd"
              fill="none"
            />
            
            {/* Draw points and labels */}
            {points.map((point, i) => {
              const size = point.value * 10;
              return (
                <g key={i}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={size}
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <text
                    x={point.x}
                    y={point.y - size - 10}
                    textAnchor="middle"
                    className="text-sm"
                  >
                    {point.type.split(' ')[1].replace(/[()]/g, '')}
                  </text>
                  <text
                    x={point.x}
                    y={point.y + 5}
                    textAnchor="middle"
                    className="text-sm font-bold"
                  >
                    {point.value.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

// Main Personality Component
const Personality = () => {
    const [personalityResults, setPersonalityResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Sample context for testing
    const sampleContext = "Me siento muy feliz y motivado hoy. He trabajado arduamente en mis proyectos y estoy viendo resultados positivos. Me gusta ayudar a otros y mantener todo organizado. A veces me preocupo por los detalles, pero intento mantener una actitud optimista.";

    useEffect(() => {
        const analyzePersonality = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const results = await api.updatePersonality(sampleContext);
                setPersonalityResults({
                    big5_result: results.big5_result,
                    enneagram_result: results.enneagram_result
                });
                console.log("Personality Analysis Results:", {
                    big5_result: results.big5_result,
                    enneagram_result: results.enneagram_result
                });
            } catch (error) {
                console.error("Error analyzing personality:", error);
                setError("Error analyzing personality. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        analyzePersonality();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading personality analysis...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Sistema de Perfilado de Personalidad</h1>
            
            {personalityResults && (
                <div className="space-y-8">
                    {/* Charts */}
                    <PersonalityCharts personalityResults={personalityResults} />
                    
                    {/* Detailed Results */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <section className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Big Five Results</h2>
                            <div className="space-y-2">
                                {Object.entries(personalityResults.big5_result).map(([trait, score]) => (
                                    <div key={trait} className="flex justify-between items-center">
                                        <span className="font-medium">{trait}</span>
                                        <span className="text-gray-600">{(score * 100).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                        
                        <section className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Enneagram Results</h2>
                            <div className="space-y-2">
                                {Object.entries(personalityResults.enneagram_result).map(([type, score]) => (
                                    <div key={type} className="flex justify-between items-center">
                                        <span className="font-medium">{type}</span>
                                        <span className="text-gray-600">{score.toFixed(1)}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <section className="bg-white p-6 rounded-lg shadow mt-8">
                        <h2 className="text-xl font-semibold mb-4">Sample Text Used for Analysis</h2>
                        <p className="text-gray-700">{sampleContext}</p>
                    </section>
                </div>
            )}
        </div>
    );
};

export default Personality;