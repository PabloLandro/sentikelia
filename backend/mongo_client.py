from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson import ObjectId
import os, json
from dotenv import load_dotenv

load_dotenv()

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

    def connect(self):
        """Establece la conexión con MongoDB."""
        try:
            self.client = MongoClient(self.uri)
            self.db = self.client[self.db_name]
            self.client.admin.command("ping")
            print(f"Conectado a MongoDB: {self.db_name}")
        except ConnectionFailure as e:
            print(f"Error de conexión: {e}")

    def get_user(self, username):
        """Recupera el JSON principal de un usuario basado en su nombre de usuario.
        Si no existe devuelve None."""
        try:
            return self.db["usuarios"].find_one({"username": username}, {"_id": 0})  # Exclude MongoDB _id field
        except Exception as e:
            print(f"MongoDB Error: {e}")
            return None

    def get_dict_usuario(self, username):
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

    def insertar_usuario_inicial(self, datos_iniciales):
        """
        Inserta un usuario nuevo a la base de datos

        Parámetros:
        - datos_iniciales (dict): dict con los datos del usuario
        """

        # Verificar si el usuario ya existe
        existing_user = self.get_user(datos_iniciales["username"]) 
        if existing_user is not None:
            print(f"Usuario '{datos_iniciales['username']}' ya existe.")
            return None  # O podrías devolver el _id existente

        # Insertar usuario nuevo
        result = self.db["usuarios"].insert_one(datos_iniciales)
        print(f"Usuario '{datos_iniciales['username']}' insertado con éxito.")
        return result.inserted_id  # Devolver el ID del nuevo usuario
    
    def update_important_context(self, new_context, username):
        """Updates the 'important_context' field for a given user."""
        result = self.db["usuarios"].update_one(
            {"username": username},  # Find user by username
            {"$set": {"important_context": new_context}}  # Update or create the field
        )

        if result.matched_count == 0:
            print(f"User '{username}' not found.")
            return False
        elif result.modified_count == 0:
            print(f"User '{username}' already had the same 'important_context' value.")
            return True  # No modification, but user exists

        print(f"User '{username}': 'important_context' updated.")
        return True  # Successfully updated
    
    """ Insertar nueva entrada en el diccionario """
    def insert_diary_entry(self, diary_entry, username):
        # Insertar en la coleccion de diarios
        inserted_id = self.db["diarios"].insert_one(diary_entry).inserted_id

        # Meter el resumen en el array
        self.db["users"].update_one(
            {"_id": username},
            {"$push": {"entradas_diario": {"resumen": diary_entry["resumen"]}}}
        )
        return inserted_id
    
    def close(self):
        """Cierra la conexión con MongoDB."""
        if self.client:
            self.client.close()
            print("Conexión a MongoDB cerrada.")

mongo_client = MongoDBClient()

# # EJEMPLO DE USO
# if __name__ == "__main__":
#     mongopass = "tu_password_aqui"
#     mongo_client = MongoDBClient(mongopass)

#     # Obtener JSON principal de un usuario
#     usuario_id = "65d1234567890abcdef12345"
#     json_principal = mongo_client.get_json_principal(usuario_id)
#     print("JSON principal:", json_principal)

#     # Obtener las últimas 3 entradas de diario
#     ultimas_entradas = mongo_client.get_last_diary_entries(usuario_id, N=3)
#     print("Últimas entradas:", ultimas_entradas)

#     # Insertar una nueva entrada
#     entrada_id = mongo_client.insert_entrada_diario(
#         usuario_id, "Hoy fue un buen día", "Día positivo con buen ánimo", 0.8
#     )
#     print("Entrada insertada con ID:", entrada_id)

#     # Actualizar importancia
#     updated = mongo_client.update_importancia(entrada_id, 1.0)
#     print("Importancia actualizada:", updated)

#     # Eliminar una entrada
#     deleted = mongo_client.delete_entrada_diario(entrada_id)
#     print("Entrada eliminada:", deleted)

#     mongo_client.close()