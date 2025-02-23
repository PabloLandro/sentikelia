# sentikelia
Esta aplicación web realizada para el hackathon __HackUDC__ se trata de un asistente psicológico personalizado, contiene 

### Funcionalidades
- Un chatbot de última tecnología en el que puedes conversar y reflexionar sobre tu día. Recuerda lo que le cuentas y 
- Un diario virtual en el que puedes introducir los mejores (y peores) monentos de cada día. sentikelia recordará todo esto en sus conversaciones.
- Un análisis de personalidad variado usando dos de los métodos más comúnes. 
- Un coach personal en el que puedes introducir un objetivo principal y este te lo descompondrá en objetivos diarios a cumplir y sugerencias generales para alcanzarlo.a


### Tecnologías usadas
- __Frontend__: React, vite, tailwind
- __Backend__: FastAPI, uvicorn, OpenAI, 
- __Base de datos__: PyMongo, MongoDB
- __Modelos__: gpt-4o-mini (Chatbot y otros usos), bert-base-multilingual-uncased-sentiment (Eneagramas), bert-base-personality (Big 5)

### Desplegar en localhost
1. Iniciar backend (puerto 8000 por defecto)
    - Configurar valores `.env`: `OPENAI_API_KEY` with the OpenAI api key and `MONGO_URI` with the MongoDB URI connection string (with password already there)
    - Configurar base de datos de MongoDB. Crear db de `sadgpt` (nombre legacy, habría que cambiarlo) y tabla de `usuarios`.
    - Install Python dependencies `pip install -r backend/requirements.txt`
    - Ejecutar con `uvicorn main:app --reload`


2. Iniciar frontend (puerto 3000 por defecto)
    - Installar paquetes npm con `npm install --legacy-peer-deps`
    - Ejecutar (en modo desarrollo) con `npm run dev`

3. La aplicación ya está lista en `localhost:3000`!