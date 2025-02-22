from pydantic import BaseModel
from typing import List

# | None = None significa que es opcional

# Modelos de la base de datos y endpoints de API
class RequestWithUsername(BaseModel):
    username: str

class ChatRequest(BaseModel):
    username: str
    message: str

class ChatEntry(BaseModel):
    prompt: str
    response: str

# Modelo inicial de una entrada de diario! La base de datos debería seguir esto y ampliarlo cuando haga falta
class DiaryEntry(BaseModel):
    entry: str
    date: str
    # Extra fields para añadir luego, antes de insertar a la DB, no vienen en el input
    summary: str = ""
    importance: float = 0.0

class DiaryRequest(BaseModel):
    username: str
    entry: DiaryEntry

# Modelo inicial del usuario! La base de datos debería seguir esto y ampliarlo cuando haga falta
class UserData(BaseModel):
    username: str
    age: int
    characteristics: List[str]
    important_context: str
    chat_tone: int
    mensajes_chat: List[ChatEntry] = []
    diary: List[DiaryEntry] = []

class ToneChangeRequest(BaseModel):
    username: str
    new_tone: int