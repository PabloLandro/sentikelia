from dotenv import load_dotenv
import os, json, requests
from prompts import *
from mongo_client import mongo_client
from model import ChatRequest, ChatEntry, CoachRequest


# Get api key from .env
load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")
API_URL = "https://api.openai.com/v1/chat/completions"

GPT_MODEL = "gpt-4o-mini"
MAX_TOKENS = 5000

# Set up headers including the authorization token
REQUEST_HEADER = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}",
}

# Not used right now
# payload = {
#     "model": GPT_MODEL,
#     "max_tokens": MAX_TOKENS,
#     "n": 1,
#     "stop": None,
#     "temperature": 0.7,
#     "messages": None,
# }

# Helper function for generating the JSON data for the LLM requests
def generate_chatgpt_data(system_prompt, user_prompt, temp):
    return {
        "model": GPT_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},

            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": MAX_TOKENS,
        "temperature": temp
    }

# Calcular costos y ponerlos en un json
def calculate_cost(response):
    input_tokens = response['usage']['prompt_tokens']
    output_tokens = response['usage']['completion_tokens']
    total_tokens = response['usage']['total_tokens']
    cost_per_token = 0.002  # Example cost per token for gpt-3.5-turbo, adjust as necessary
    cost_per_thousand_input_tokens = 0.0015
    cost_per_thousand_output_tokens = 0.002

    coste_entrada = (input_tokens / 1000) * cost_per_thousand_input_tokens
    coste_salida = (output_tokens / 1000) * cost_per_thousand_output_tokens
    coste_total = coste_entrada + coste_salida

    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "total_cost": coste_total
    }

# Main function for interacting with the chatbot LLM
def chat_interaction(chat_req: ChatRequest):
    data = generate_chatgpt_data(get_system_prompt(mongo_client.get_dict_usuario(chat_req.username)),
        chat_req.message, 0.2)
    
    response = requests.post(API_URL, headers=REQUEST_HEADER, json=data)
    if response.status_code == 200:
        response_content = response.json()['choices'][0]['message']['content']
        response_json = json.loads(response_content) # esto puede fallar si la LLM se vuelve loca
        chat_entry = ChatEntry(prompt=chat_req.message, response=response_json["respuesta"])

        mongo_client.insert_chat_message(chat_entry, chat_req.username)
        # Añadir el contexto que la LLM piensa que es importante a MongoDB
        mongo_client.update_important_context(chat_req.username, response_json["important_context"])
        return response_json["respuesta"]
    else:
        raise Exception(f"OpenAI API request failed with status code {response.status_code}: {response.text}")

# Main function for summarizing and extracting insights from diary entries
def generate_diary_summary(username, diary_entry):
    data = generate_chatgpt_data(prompt_resumir_diario(diary_entry), diary_entry, 0.2)
    response = requests.post(API_URL, headers=REQUEST_HEADER, json=data)
    if response.status_code == 200:
        response_content = response.json()['choices'][0]['message']['content']
        return response_content
    else:
        raise Exception(f"OpenAI API request failed with status code {response.status_code}: {response.text}")
    
def generate_new_context_from_diary(username, diary_entry_str):
    # Extraer el user data
    user_data = mongo_client.get_dict_usuario(username)
    # Sacar el system prompt y hacer la request al LLM
    system_prompt = create_new_important_context_from_diary(user_data, diary_entry_str)
    data = generate_chatgpt_data(system_prompt, diary_entry_str, 0.2)
    # Hacer la request al LLM
    print("DATA = ", data)
    response = requests.post(API_URL, headers=REQUEST_HEADER, json=data)
    if response.status_code == 200:
        response_content = response.json()['choices'][0]['message']['content']
        print("RESPONSE = ", response_content)
        response_json = json.loads(response_content) # esto puede fallar si la LLM se vuelve loca
        # Añadir el nuevo contexto importante a MongoDB
        mongo_client.update_important_context(username, response_json["important_context"])
        return response_json["important_context"]
    else:
        raise Exception(f"OpenAI API request failed with status code {response.status_code}: {response.text}")

def generate_personality_explanation(text, big5, ennegram):
    data = generate_chatgpt_data(generate_personality_assessment(text, big5, ennegram), "", 0.2)
    response = requests.post(API_URL, headers=REQUEST_HEADER, json=data)
    if response.status_code == 200:
        response_content = response.json()['choices'][0]['message']['content']
        return response_content
    else:
        raise Exception(f"OpenAI API request failed with status code {response.status_code}: {response.text}")

def coach_generate_daily_objectives(coach_req: CoachRequest):
    user_data = mongo_client.get_dict_usuario(coach_req.username)
    system_prompt = coach_generate_objectives_prompt(user_data, coach_req.main_objective)
    data = generate_chatgpt_data(system_prompt, coach_req.main_objective, 0.2)

    response = requests.post(API_URL, headers=REQUEST_HEADER, json=data)
    if response.status_code == 200:
        response_content = response.json()['choices'][0]['message']['content']
        response_json = json.loads(response_content) # esto puede fallar si la LLM se vuelve loca
        return response_json
    else:
        raise Exception(f"OpenAI API request failed with status code {response.status_code}: {response.text}")

def coach_generate_suggestions(username: str):
    # Retrieve user data from MongoDB
    user_data = mongo_client.get_dict_usuario(username)
    if not user_data:
        return None
    
    system_prompt = coach_generate_suggestions_prompt(user_data)
    data = generate_chatgpt_data(system_prompt, "", 0.2)
    response = requests.post(API_URL, headers=REQUEST_HEADER, json=data)
    
    if response.status_code == 200:
        response_content = response.json()['choices'][0]['message']['content']
        try:
            response_json = json.loads(response_content)
            return response_json
        except json.JSONDecodeError as e:
            raise Exception("Failed to parse JSON response: " + str(e))
    else:
        raise Exception(f"OpenAI API request failed with status code {response.status_code}: {response.text}")
    


def generate_bulby_questions(big5, ennegram):
    data = generate_chatgpt_data(generate_coach_questions(big5, ennegram), "", 0.2)
    response = requests.post(API_URL, headers=REQUEST_HEADER, json=data) ### 
    if response.status_code == 200:
        response_content = response.json()['choices'][0]['message']['content']
        try:
            response_json = json.loads(response_content)
            return response_json
        except json.JSONDecodeError as e:
            raise Exception("Failed to parse JSON response: " + str(e))
    else:
        raise Exception(f"OpenAI API request failed with status code {response.status_code}: {response.text}")