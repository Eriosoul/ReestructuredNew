import os
from datetime import timedelta
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    # MongoDB - asegurar que apunta a localhost
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/intelops')

    # CORS
    CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:3000']