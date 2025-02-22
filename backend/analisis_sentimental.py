from transformers import pipeline
import nltk
from collections import defaultdict
import datetime
from model import DiaryEntry
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os

# Load the sentiment-analysis pipeline using a Spanish model
sentiment_pipeline = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

# Function to analyze diary trends using the Spanish model
# def analizar_tendencias_diario(diario_full):
#     tendencias = defaultdict(list)

#     for entry in diario_full:
#         result = sentiment_pipeline(entry.entry)[0]
#         date = datetime.datetime.strptime(entry.date, "%Y-%m-%d")
#         score = result['score'] if result['label'] == '5 stars' else -result['score']
#         tendencias['dates'].append(date)
#         tendencias['scores'].append(score)

#     return tendencias

def classify_enneagram(texto):
    """Clasifica un texto en los 9 tipos del Eneagrama basado en sentimiento."""
    sentiment_result = sentiment_pipeline(texto)[0]  # Analiza el sentimiento
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

def classify_big5(diary_entries):
    tokenizer = AutoTokenizer.from_pretrained("Minej/bert-base-personality")
    model = AutoModelForSequenceClassification.from_pretrained("Minej/bert-base-personality")
    texto = " ".join(entry.entry for entry in diary_entries)
    inputs = tokenizer(texto, return_tensors="pt", truncation=True, padding=True)
    personalidad = model(**inputs)

    # Extract logits and convert to probabilities
    logits = personalidad.logits.detach().numpy()[0]
    labels = ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]
    probabilities = (logits - logits.min()) / (logits.max() - logits.min())  # Normalize to [0, 1]

    # Save Big 5 personality traits in a variable
    big5_traits = dict(zip(labels, probabilities))
    return big5_traits
