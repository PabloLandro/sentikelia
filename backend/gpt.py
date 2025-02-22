from dotenv import load_dotenv
import os, json, requests
from prompts import *
from context_manager import *
from mongo_client import mongo_client

# Get api key from .env
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
api_url = "https://api.openai.com/v1/chat/completions"

model = "gpt-4o-mini"
max_tokens = 1000

# Set up headers including the authorization token
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}",
}

payload = {
    "model": model,
    "max_tokens": max_tokens,
    "n": 1,
    "stop": None,
    "temperature": 0.7,
    "messages": None,
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

def call_openai(prompt, username="usuario_test"):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": get_system_prompt(mongo_client.get_dict_usuario(username))},

            {"role": "user", "content": prompt}
        ],
        "max_tokens": 150,
        "temperature": 0.2
    }

    response = requests.post(api_url, headers=headers, json=data)
    if response.status_code == 200:
        response_content = response.json()['choices'][0]['message']['content']
        response_json = json.loads(response_content) # esto puede fallar si la LLM se vuelve loca
        # Añadir a la in-memory store el contexto general del chat
        append_context(username, prompt + response_json["respuesta"])
        # Añadir el contexto que la LLM piensa que es importante a MongoDB
        mongo_client.update_important_context(response_json["contexto_importante"], username)
        return response_json["respuesta"]
    else:
        raise Exception(f"OpenAI API request failed with status code {response.status_code}: {response.text}")

# def generate_gpt_response(user_message):
#     try:
#         # Make the GPT API call to generate a response
#         payload["messages"] = [{"role": "user", "content": user_message}]
#         # Make a POST request to the API endpoint
#         response = requests.post(api_url, headers=headers, json=payload)

#         # Check if the request was successful
#         if response.status_code == 200:
#             response_content = response.json()['choices'][0]['message']['content']
#             print(response_content)
#             return response_content
#         else:
#             # Handle error responses
#             raise Exception(f"Error: {response.status_code} - {response.text}")
#     except Exception as e:
#         return f"Error: {str(e)}"