import os, requests, re, sys
import json
from prompts import *

from openai import OpenAI
from dotenv import load_dotenv
import tiktoken
from mongo_client import MongoDBClient
from context_manager import *

model = "gpt-4o-mini"

# Create a global MongoDB client instance

####################################################

# MongoDB config


def call_openai(prompt):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": get_system_prompt(mongo_client.get_dict_usuario("usuario_test"))},

            {"role": "user", "content": prompt}
        ],
        "max_tokens": 150,
        "temperature": 0.2
    }

    response = requests.post(api_url, headers=headers, json=data)
    if response.status_code == 200:
        resp_json = response.json()
        # Añadir a la in-memory store el contexto general del chat
        append_context("usuario_test", prompt + response)
        # Añadir el contexto que la LLM piensa que es importante a MongoDB
        mongo_client.update_important_context(resp_json["contexto_importante"])
        return resp_json
    else:
        raise Exception(f"OpenAI API request failed with status code {response.status_code}: {response.text}")




# Example usage
prompt = "Hola me llamo Maria Unpajote y estoy muy triste"
response = call_openai(prompt)
print(response['choices'][0]['message']['content'])
cost = calculate_cost(response)
print(cost)

# Save response and cost to MongoDB
response_data = {
    "prompt": prompt,
    "response": response['choices'][0]['message']['content'],
    "cost": cost
}




