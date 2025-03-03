def classify_enneagram(texto):
    """Clasifica un texto en los 9 tipos del Eneagrama basado en sentimiento."""
    from transformers import pipeline  # Import inside the function
    # Load the sentiment-analysis pipeline using a Spanish model
    sentiment_pipeline = pipeline(
        "sentiment-analysis", 
        model="nlptown/bert-base-multilingual-uncased-sentiment", 
        tokenizer="nlptown/bert-base-multilingual-uncased-sentiment"
    )

    sentiment_result = sentiment_pipeline(texto)[0]  # Analiza el sentimiento
    rating = int(sentiment_result['label'][0])  # Extraer la estrella (1-5)
    print(rating)

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
 
def classify_big5(text):
    from transformers import BertTokenizer, BertForSequenceClassification  # Import inside the function
    import torch
    import torch.nn.functional as F

    tokenizer = BertTokenizer.from_pretrained("Minej/bert-base-personality")
    model = BertForSequenceClassification.from_pretrained("Minej/bert-base-personality")

    inputs = tokenizer(text, truncation=True, padding=True, return_tensors="pt")
    outputs = model(**inputs)
    print(outputs)
    
    # Convertir logits a probabilidades usando sigmoid (o softmax si son clases exclusivas)
    logits = outputs.logits.squeeze().detach()
    probabilities = torch.exp(logits) / torch.exp(logits).sum()

    label_names = ['Extraversion', 'Neuroticism', 'Agreeableness', 'Conscientiousness', 'Openness']
    result = {label_names[i]: float(probabilities[i]) for i in range(len(label_names))}

    return result