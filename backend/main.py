from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
from gpt import chat_interaction, generate_diary_summary
from mongo_client import mongo_client
from typing import List
from datetime import date
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

@app.post("/chats/")
async def send_chat_message(user_message: ChatMessage):
    gpt_response = chat_interaction(user_message.message)
    return JSONResponse(content={"message": gpt_response})

class LoginRequest(BaseModel):
    username: str

@app.post("/login/")
async def login(logreq: LoginRequest):
    if mongo_client.get_user(logreq.username) is not None:
        return JSONResponse(content={"message": "true"})
    else:
        return JSONResponse(content={"message": "false"})


# Modelo inicial del usuario! La base de datos debería seguir esto y ampliarlo cuando haga falta
class UserData(BaseModel):
    username: str
    age: int
    characteristics: List[str]
    mood: str
    important_context: str
    chat_tone: int

@app.post("/loginform/")
async def login_form(user_data: UserData):
    # solo puede fallar si el usuario ya existe
    user_dict = user_data.model_dump()
    if mongo_client.insertar_usuario_inicial(user_dict) is not None:
        return JSONResponse(content={"message" : "true"})
    else:
        return JSONResponse(content={"message" : "false"})

# Modelo inicial de una entrada de diario! La base de datos debería seguir esto y ampliarlo cuando haga falta
class DiaryEntry(BaseModel):
    usuario: str  # Referencia al usuario que envia la entrada de diario
    entry: str
    # Extra fields para añadir luego, no vienen en el input
    summary: str
    importance: float

# nueva entrada en el diario, argumentos to be decided (imagen vs texto, a lo mejor hacen falta 2 rutas)
@app.post("/diary")
async def new_diary_entry(diary_entry: DiaryEntry):
    diary_entry.summary = generate_diary_summary(diary_entry.username, generate_diary_summary.entry)
    # TODO importance and other analysis of the diary contents
    if mongo_client.insert_diary_entry(diary_entry.model_dump()) is not None:
        return JSONResponse(content={"message" : "true"})
    else:
        return JSONResponse(content={"message": "false"})

# modificar el modo del chat, TODO
@app.post("/chatmode")
async def modify_chat_mode(chat_mode):
    pass

