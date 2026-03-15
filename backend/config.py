import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/intelops')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hora