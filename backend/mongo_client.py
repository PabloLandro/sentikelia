from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson import ObjectId
import os, json
from dotenv import load_dotenv
from model import *
import datetime

load_dotenv()
MAX_MESSAGES = 25

class MongoDBClient:
    def __init__(self, db_name="sadgpt"):
        """
        Initializes the MongoDB client with authentication.
        
        :param mongopass: MongoDB password for authentication
        :param db_name: Database name
        """
        mongopass = os.getenv("MONGO_PASSWORD")
        self.uri = f"mongodb+srv://sadgpt:{mongopass}@sadgpt.ukjmz.mongodb.net/?retryWrites=true&w=majority&appName=sadgpt"
        self.db_name = db_name
        self.client = None
        self.db = None
        self.connect()
        self.users_table = self.db["usuarios"]

    def connect(self):
        """Establece la conexión con MongoDB."""
        try:
            self.client = MongoClient(self.uri)
            self.db = self.client[self.db_name]
            self.client.admin.command("ping")
            print(f"Conectado a MongoDB: {self.db_name}")
        except ConnectionFailure as e:
            print(f"Error de conexión: {e}")

    def get_user(self, username: str):
        """Recupera el JSON principal de un usuario basado en su nombre de usuario.
        Si no existe devuelve None."""
        try:
            return self.users_table.find_one({"username": username}, {"_id": 0})  # Exclude MongoDB _id field
        except Exception as e:
            print(f"MongoDB Error: {e}")
            return None

    def get_dict_usuario(self, username: str):
        """
        Recupera los datos del usuario desde MongoDB y los convierte en un diccionario sin modificaciones.

        Parámetros:
        - username (str): Nombre de usuario en MongoDB.

        Retorna:
        - dict: Diccionario con la información del usuario o None si no se encuentra.
        """
        usuario_data = self.get_user(username)
        if not usuario_data:
            return None  # Si no se encuentra el usuario, retorna None

        return json.loads(json.dumps(usuario_data))  # Asegura que sea un dict estándar

    def insertar_usuario_inicial(self, user_data: UserData)  -> bool:
        existing_user = self.users_table.find_one({"username": user_data.username})
        if existing_user:
            print(f"Usuario '{user_data.username}' ya existe.")
            return False
        user_data = user_data.model_dump()
        result = self.users_table.insert_one(user_data)
        return True
    
    def update_important_context(self, username: str, new_context: str) -> bool:
        user = self.users_table.find_one({"username": username})
        if user and isinstance(user.get("important_context"), list):
            self.users_table.update_one(
                {"username": username},
                {"$set": {"important_context": " ".join(user["important_context"])}}
            )
        else:
            self.users_table.update_one(
                {"username": username, "important_context": {"$exists": False}},
                {"$set": {"important_context": ""}}
            )
        result = self.users_table.update_one(
            {"username": username},  # Find user by username
            {"$set": {"important_context": new_context}}  # Set the new context as a string
        )

        if result.matched_count == 0:
            print(f"User '{username}' not found.")
            return False
        elif result.modified_count == 0:
            print(f"User '{username}' already had the same 'important_context' value.")
            return True  # No modification, but user exists

        print(f"User '{username}': 'important_context' updated.")
        return True  # Successfully updated
    
    def insert_chat_message(self, chat_entry: ChatEntry, username: str) -> bool:
        """Inserta un nuevo mensaje de chat en la base de datos y mantiene solo los últimos N mensajes."""
        user = self.users_table.find_one({"username": username})
        if not user:
            return False
        
        self.users_table.update_one(
            {"username": username},
            {"$push": {"mensajes_chat": {"$each": [chat_entry.model_dump()], "$slice": -MAX_MESSAGES}}}
        )
        return True

    def has_diary_entry_today(self, username: str) -> bool:
        """Check if the user already has a diary entry for today."""
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = datetime.utcnow().replace(hour=23, minute=59, second=59, microsecond=999999)

        user = self.users_table.find_one(
            {
                "username": username,
                "diary.date": {"$gte": today_start, "$lte": today_end}
            },
            {"diary.$": 1}  # Project only the matching diary entry
        )

        return bool(user)  # Returns True if a diary entry for today exists
    
    def insert_diary_entry(self, username: str, diary_entry: DiaryEntry) -> bool:
        """
        Inserts a new diary entry for a given user. If an entry on the same date exists, it replaces it.
        
        :param mongo_client: Instance of MongoDBClient.
        :param username: Username of the user making the entry.
        :param diary_entry: The diary entry to insert.
        """
        user = mongo_client.users_table.find_one({"username": username})
        if not user:
            raise ValueError("User not found")
        
        # Ensure diary list exists
        if "diary" not in user:
            user["diary"] = []
        
        # Check if an entry for the same date exists
        existing_entries = user["diary"]
        updated_entries = [entry for entry in existing_entries if entry["date"] != diary_entry.date]
        
        # Append the new entry
        updated_entries.append(diary_entry.model_dump())
        
        # Update the user's diary in the database
        result = mongo_client.users_table.update_one(
            {"username": username},
            {"$set": {"diary": updated_entries}}
        )
        
        return result.modified_count > 0

    def get_diary_entries(self, username: str):
        """Retrieve all diary entries as a dictionary with date keys and entry values."""
        user = self.users_table.find_one({"username": username}, {"diary": 1, "_id": 0})

        if not user or "diary" not in user or user["diary"] is None:
            return {}  # Return empty dictionary if no entries found

        return {
            diary["date"]: {  # Keep the date as a string
                "entry": diary["entry"],
                "summary": diary.get("summary"),
                "importance": diary.get("importance")
            }
            for diary in user["diary"]
        }

    def close(self):
        """Cierra la conexión con MongoDB."""
        if self.client:
            self.client.close()
            print("Conexión a MongoDB cerrada.")

mongo_client = MongoDBClient()