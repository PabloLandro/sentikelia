from transformers import pipeline
import nltk
from collections import defaultdict
import datetime
from model import DiaryEntry
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()
# Get your Hugging Face token from environment variable
hf_token = os.getenv("HF_TOKEN")

if not hf_token:
    raise ValueError("Hugging Face token not found. Please set the HF_TOKEN environment variable.")

# Create a list of DiaryEntry objects with test entries
myDiary = [
    DiaryEntry(date="2023-01-01", entry="Hoy me siento muy feliz porque he logrado mis objetivos. He trabajado duro durante semanas y finalmente he visto los resultados. Además, he recibido felicitaciones de mis compañeros de trabajo, lo cual me ha motivado aún más.", summary='', importance=5),
    DiaryEntry(date="2023-01-02", entry="Estoy un poco triste porque no pude ver a mis amigos. Habíamos planeado reunirnos para cenar, pero al final todos tuvieron compromisos de última hora. Espero que podamos vernos pronto.", summary='', importance=3),
    DiaryEntry(date="2023-01-03", entry="Me siento neutral, hoy fue un día normal. No hubo nada fuera de lo común en el trabajo y la rutina diaria fue bastante monótona. Sin embargo, aproveché para leer un libro interesante por la noche.", summary='', importance=2),
    DiaryEntry(date="2023-01-04", entry="Estoy emocionado por el proyecto en el que estoy trabajando. Hemos tenido una reunión muy productiva y creo que estamos en el camino correcto para lograr algo grande. La colaboración con el equipo ha sido excelente.", summary='', importance=4),
    DiaryEntry(date="2023-01-05", entry="Me siento ansioso por la reunión de mañana. Es una presentación importante y quiero asegurarme de que todo salga bien. He estado practicando mi discurso y revisando los detalles una y otra vez.", summary='', importance=4),
    DiaryEntry(date="2023-01-06", entry="Hoy me siento agradecido por todo el apoyo que he recibido de mi familia. Han estado a mi lado en los momentos difíciles y siempre me han motivado a seguir adelante.", summary='', importance=5),
    DiaryEntry(date="2023-01-07", entry="Estoy frustrado porque no he podido resolver un problema en el trabajo. He pasado horas intentándolo y no veo una solución clara. Necesito tomar un descanso y volver a intentarlo mañana.", summary='', importance=2),
    DiaryEntry(date="2023-01-08", entry="Me siento relajado después de un día de descanso. He pasado tiempo con mi familia y hemos disfrutado de una comida deliciosa juntos. Estos momentos son los que realmente importan.", summary='', importance=4),
    DiaryEntry(date="2023-01-09", entry="Estoy preocupado por la situación económica actual. Los precios están subiendo y me preocupa cómo esto afectará a mi familia. Necesito encontrar maneras de ahorrar y ser más eficiente con los gastos.", summary='', importance=3),
    DiaryEntry(date="2023-01-10", entry="Hoy me siento inspirado después de asistir a una conferencia sobre innovación. Los ponentes compartieron ideas fascinantes y me han dado muchas cosas en las que pensar. Estoy emocionado por aplicar lo aprendido en mi trabajo.", summary='', importance=5)
]

# Load the sentiment-analysis pipeline using a Spanish model
sentiment_pipeline = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

# Function to analyze diary trends using the Spanish model
def analizar_tendencias_diario(diario_full):
    tendencias = defaultdict(list)

    for entry in diario_full:
        result = sentiment_pipeline(entry.entry)[0]
        date = datetime.datetime.strptime(entry.date, "%Y-%m-%d")
        score = result['score'] if result['label'] == '5 stars' else -result['score']
        tendencias['dates'].append(date)
        tendencias['scores'].append(score)

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(tendencias['dates'], tendencias['scores'], marker='o', linestyle='-', color='b', label='Sentiment Score')

    # Formatting the date axis
    ax.xaxis.set_major_locator(mdates.DayLocator())
    ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
    plt.xticks(rotation=45)

    # Adding labels and title
    plt.xlabel('Date')
    plt.ylabel('Sentiment Score')
    plt.title('Emotional Trends Over Time')
    plt.legend()
    plt.grid(True)

    # Adding annotations for better explainability
    for i, txt in enumerate(tendencias['scores']):
        ax.annotate(f'{txt:.2f}', (tendencias['dates'][i], tendencias['scores'][i]), textcoords="offset points", xytext=(0,10), ha='center')

    plt.tight_layout()

def classify_enneagram(text):
    """Clasifica un texto en los 9 tipos del Eneagrama basado en sentimiento."""
    sentiment_result = sentiment_pipeline(text)[0]  # Analiza el sentimiento
    rating = int(sentiment_result['label'][0])  # Extraer la estrella (1-5)

    # Mapeo heurístico de sentimiento a tipos del Eneagrama
    scores = {
        "Type 1 (Perfectionist)": rating * 0.9,  
        "Type 2 (Helper)": rating * 1.1,  
        "Type 3 (Achiever)": rating * 0.8,  
        "Type 4 (Individualist)": (5 - rating) * 1.2,  
        "Type 5 (Investigator)": (3 if rating == 3 else abs(3 - rating)) * 1.0,  
        "Type 6 (Loyalist)": (5 - rating) * 1.1,  
        "Type 7 (Enthusiast)": rating * 1.2,  
        "Type 8 (Challenger)": rating * 1.1,  
        "Type 9 (Peacemaker)": 3.5 if rating == 3 else (5 - abs(3 - rating)) * 1.2
    }

    return scores

# Load the personality classification pipeline
# Load model directly

tokenizer = AutoTokenizer.from_pretrained("Minej/bert-base-personality")
model = AutoModelForSequenceClassification.from_pretrained("Minej/bert-base-personality")
texto = " ".join(entry.entry for entry in myDiary)
inputs = tokenizer(texto, return_tensors="pt", truncation=True, padding=True)
personalidad = model(**inputs)

# Extract logits and convert to probabilities
logits = personalidad.logits.detach().numpy()[0]
labels = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]
probabilities = (logits - logits.min()) / (logits.max() - logits.min())  # Normalize to [0, 1]

# Save Big 5 personality traits in a variable
big5_traits = dict(zip(labels, probabilities))

# Plotting the Big 5 personality traits
fig, ax = plt.subplots(figsize=(10, 6))
ax.bar(labels, probabilities, color='skyblue')
ax.set_ylim(0, 1)
ax.set_ylabel('Probability')
ax.set_title('Big 5 Personality Traits')

# Adding labels on top of the bars
for i, prob in enumerate(probabilities):
    ax.text(i, prob + 0.02, f'{prob:.2f}', ha='center')

plt.tight_layout()
plt.show()

# Eneagram representation
eneagram_labels = ["Reformer", "Helper", "Achiever", "Individualist", "Investigator", "Loyalist", "Enthusiast", "Challenger", "Peacemaker"]

# Save Enneagram scores in a variable
enneagram_scores = classify_enneagram(texto)
