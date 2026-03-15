from utils.database import mongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime

class User:
    collection = mongo.db.users

    @staticmethod
    def create(data):
        # data debe contener: email, password, name, role (opcional)
        if 'role' not in data:
            data['role'] = 'analyst'  # por defecto
        if 'permissions' not in data:
            # Asignar permisos según rol (puedes personalizar)
            data['permissions'] = ['read']  # básico
        if data['role'] == 'admin':
            data['permissions'] = ['*']
        elif data['role'] == 'analyst':
            data['permissions'] = ['read', 'write']
        elif data['role'] == 'operator':
            data['permissions'] = ['read', 'operate']
        elif data['role'] == 'viewer':
            data['permissions'] = ['read']
        
        data['password'] = generate_password_hash(data['password'])
        data['createdAt'] = data.get('createdAt', datetime.utcnow())
        data['lastLogin'] = None
        
        result = User.collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @staticmethod
    def find_by_email(email):
        return User.collection.find_one({'email': email})

    @staticmethod
    def find_by_id(user_id):
        return User.collection.find_one({'_id': ObjectId(user_id)})

    @staticmethod
    def verify_password(user, password):
        return check_password_hash(user['password'], password)

    @staticmethod
    def update_last_login(user_id):
        User.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'lastLogin': datetime.utcnow()}}
        )