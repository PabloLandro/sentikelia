from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
from gpt import call_openai

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",  # React app URL
    "http://localhost:8000",  # Add your backend URL here if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

class ChatMessage(BaseModel):
    message: str

chats = []

@app.post("/chats/")
async def send_chat_message(chat_message: ChatMessage):
    user_message = chat_message.message
    gpt_response = call_openai(user_message)

    # Store the message and GPT's response in the chat
    chats.append({"user": user_message, "gpt": gpt_response})
    print(gpt_response)
    return JSONResponse(content={"message": gpt_response})

