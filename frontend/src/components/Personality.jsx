import React from 'react';
//import { analyzeSentiment, classifyPersonality } from '../utils/analisis_sentimental';


const Personality = () => {
    const big5_traits = classifyPersonality('big5');
    const enneagram_scores = classifyPersonality('enneagram');

    console.log("Big 5 Personality Traits:", big5_traits);
    console.log("Enneagram Scores:", enneagram_scores);

    return (
        <div>
            <h1>Sistema de Perfilado de Personalidad</h1>
            <section>
                <h2>Clasificación de Personalidad con Información Contextual</h2>
                <p>En esta sección, proporcionaremos información contextual para ayudar a clasificar la personalidad.</p>
            </section>
            <section>
                <h2>Modelos Psicológicos</h2>
                <div>
                    <h3>Eneagrama</h3>
                    <p>El Eneagrama es un modelo de nueve tipos de personalidad que describe patrones en cómo las personas interpretan el mundo y gestionan sus emociones.</p>
                    <p>Resultados del Eneagrama:</p>
                    <ul>
                        {enneagram_scores.map((score, index) => (
                            <li key={index}>{score.name}: {score.score}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3>Big Five</h3>
                    <p>El modelo Big Five describe la personalidad en términos de cinco grandes dimensiones: apertura a la experiencia, responsabilidad, extraversión, amabilidad y neuroticismo.</p>
                    <p>Resultados del Big Five:</p>
                    <ul>
                        {big5_traits.map((trait, index) => (
                            <li key={index}>{trait.name}: {trait.score}</li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default Personality;