from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
from gpt import *
from analisis_sentimental import classify_enneagram, classify_big5
from mongo_client import mongo_client
from datetime import date
from model import *
import json
app = FastAPI()

# Config de CORS
origins = [
    "http://localhost:3000",  # React app URL
    "http://localhost:8000",  # Add your backend URL here if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


#########################################
###########       RUTAS       ###########
#########################################

# Ruta de login
@app.post("/login/")
async def login(req: RequestWithUsername):
    if mongo_client.get_user(req.username) is not None:
        return JSONResponse(content={"message": "true"})
    else:
        return JSONResponse(content={"message": "false"})

# Ruta de nuevo mensaje de chat
@app.post("/chats/")
async def send_chat_message(chat_req: ChatRequest):
    gpt_response = chat_interaction(chat_req)
    return JSONResponse(content={"message": gpt_response})

# Ruta de formulario de registro
@app.post("/loginform/")
async def login_form(user_data: UserData):
    # solo puede fallar si el usuario ya existe
    if mongo_client.insertar_usuario_inicial(user_data) is not None:
        return JSONResponse(content={"message" : "true"})
    else:
        return JSONResponse(content={"message" : "false"})

# Nueva entrada en el diario, argumentos to be decided (imagen vs texto, a lo mejor hacen falta 2 rutas)

# Ruta para obtener entradas de diario
@app.get("/diary")
async def get_diary(username: str = Query(..., description="The username to fetch diary entries for")):
    user_diaries = mongo_client.get_diary_entries(username)
    return JSONResponse(content=user_diaries)

# Ruta para añadir entrada de diario
@app.post("/diary")
async def new_diary_entry(diary_req: DiaryRequest): #username, entry  
    username = diary_req.username
    diary_entry = diary_req.entry
    generate_new_context_from_diary(username, diary_entry.entry)

    # TODO importance and other analysis of the diary contents
    if mongo_client.insert_diary_entry(username, diary_entry) is not None:
        return JSONResponse(content={"message" : "true"})
    else:
        return JSONResponse(content={"message": "false"})

# Ruta para modificar el modo del chat, TODO
@app.post("/chatmode")
async def modify_chat_mode(chat_mode):
    pass

# Ruta para modificar el modo del chat, TODO
@app.get("/tone")
async def get_tone(username: str = Query(..., description="The username to fetch diary entries for")):
    user = mongo_client.get_user(username)
    if user is not None and "chat_tone" in user:
        return JSONResponse(content={"message": user["chat_tone"]})
    else:
        return JSONResponse(content={"message": 0})

# Ruta para modificar el modo del chat, TODO
@app.post("/tone")
async def update_tone(tone_req: ToneChangeRequest):
    user = mongo_client.get_user(tone_req.username)
    if user is not None and mongo_client.update_tone(tone_req):
        return JSONResponse(content={"message": "true"})
    else:
        return JSONResponse(content={"message": "false"})

@app.post("/personality")
async def update_personality(personality_req: PersonalityChangeRequest):
    username = personality_req.username
    userData = mongo_client.get_dict_usuario(username)
    important_context = userData.get('important_context', '')
    mensajes_chat = userData.get('mensajes_chat', '')
    diary = userData.get('diary', '')
    user_messages = " ".join([msg['prompt'] for msg in mensajes_chat])
    text = f"{important_context} {user_messages} {diary}"

    enneagram_result = classify_enneagram(text)
    big5_result = classify_big5(text)
    # generar explicacoin llamando a llm
    return JSONResponse(content={"enneagram_result": enneagram_result, "big5_result": big5_result})

@app.post("/personalityexplanation")
async def generate_big5_and_ennegram_explanation(personality_exp_req: PersonalityExplanationRequest):
    username = personality_exp_req.username
    userData = mongo_client.get_dict_usuario(username)
    important_context = userData.get('important_context', '')
    mensajes_chat = userData.get('mensajes_chat', '')
    diary = userData.get('diary', '')
    user_messages = " ".join([msg['prompt'] for msg in mensajes_chat])
    text = f"{important_context} {user_messages} {diary}"
    big5 = personality_exp_req.explanation_big5
    enneagram = personality_exp_req.explanation_ennegram
    
    # Generar explicacion llamando a llm a partir de los resultados de big5 y enneagram y el texto
    explanation_str = generate_personality_explanation(text, big5, enneagram)
    return JSONResponse(content=explanation_str)
    
@app.get("/coach/objectives")
async def get_objectives(username: str = Query(..., description="The username to fetch diary entries for")):
    # devuelve un JSON con main_objective y daily_objectives
    user_data = mongo_client.get_user(username)

    if user_data is not None:
        return JSONResponse(content={"message": "true"})
    else:
        return JSONResponse(content={"message": "false"})

@app.post("/coach/generate")
async def generate_coach_objectives_suggestions(coach_req: CoachRequest):
    objectives_json = coach_generate_daily_objectives(coach_req)
    print("OBJECTIVES LIST: ", objectives_json["objectives"])
    mongo_client.update_objectives(coach_req.username, coach_req.main_objective, objectives_json["objectives"])

    # also generate initial suggestions and append them to the JSON
    suggestions_json = coach_generate_recommendations(coach_req.username)
    return JSONResponse(content={
        "objectives": objectives_json["objectives"],
        "suggestions": suggestions_json["suggestions"]
    })    
    
@app.post("/coach/update")
async def reload_coach_suggestions(req_user: RequestWithUsername):
    suggestions_json = coach_generate_recommendations(req_user.username)
    return JSONResponse(content=suggestions_json)