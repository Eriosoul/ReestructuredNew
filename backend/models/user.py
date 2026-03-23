from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import datetime
from utils.database import mongo
import logging

logger = logging.getLogger(__name__)


class User:

    @staticmethod
    def get_collection():
        """Obtiene la colección de usuarios"""
        try:
            return mongo.db.users
        except Exception as e:
            logger.error(f"Error obteniendo colección users: {e}")
            return None

    @staticmethod
    def create(data):
        """Crea un nuevo usuario en la base de datos con generación automática de username"""
        try:
            logger.info(f"Intentando crear usuario con email: {data.get('email')}")

            collection = User.get_collection()
            if collection is None:
                logger.error("No se pudo obtener la colección de usuarios")
                return None

            # Crear una copia para no modificar el original
            user_data = data.copy()

            # 🔥 GENERAR USERNAME AUTOMÁTICAMENTE si no existe
            if 'username' not in user_data or not user_data.get('username'):
                # Usar el email antes del @ como username base
                email = user_data.get('email', '')
                base_username = email.split('@')[0] if '@' in email else 'user'

                # Asegurar que el username sea único
                username = base_username
                counter = 1
                while collection.find_one({'username': username}):
                    username = f"{base_username}{counter}"
                    counter += 1

                user_data['username'] = username
                logger.info(f"Username generado automáticamente: {username}")

            # Asignar rol y permisos por defecto
            if 'role' not in user_data:
                user_data['role'] = 'analyst'
            if 'permissions' not in user_data:
                user_data['permissions'] = ['read']

            # Configurar permisos según el rol
            if user_data['role'] == 'admin':
                user_data['permissions'] = ['*']
            elif user_data['role'] == 'analyst':
                user_data['permissions'] = ['read', 'write']
            elif user_data['role'] == 'operator':
                user_data['permissions'] = ['read', 'operate']
            elif user_data['role'] == 'viewer':
                user_data['permissions'] = ['read']

            # Hashear contraseña
            user_data['password'] = generate_password_hash(user_data['password'])

            # Añadir timestamps
            now = datetime.utcnow()
            user_data['createdAt'] = now
            user_data['updatedAt'] = now
            user_data['lastLogin'] = None

            logger.info(f"Insertando usuario en MongoDB...")
            result = collection.insert_one(user_data)

            if not result.inserted_id:
                logger.error("No se pudo obtener el ID insertado")
                return None

            logger.info(f"Usuario insertado con ID: {result.inserted_id}")

            # Recuperar el documento completo
            created_user = collection.find_one({'_id': result.inserted_id})

            if not created_user:
                logger.error("No se pudo recuperar el usuario creado")
                return None

            logger.info(f"Usuario creado exitosamente: {created_user.get('email')}")
            return created_user

        except Exception as e:
            logger.error(f"Error en User.create: {str(e)}", exc_info=True)
            return None

    @staticmethod
    def find_by_email(email):
        """Busca un usuario por email"""
        try:
            collection = User.get_collection()
            if collection is None:
                logger.error("La colección de usuarios es None en find_by_email")
                return None
            return collection.find_one({'email': email})
        except Exception as e:
            logger.error(f"Error en find_by_email: {str(e)}", exc_info=True)
            return None

    @staticmethod
    def find_by_id(user_id):
        """Busca un usuario por ID"""
        try:
            collection = User.get_collection()
            if collection is None:
                logger.error("La colección de usuarios es None en find_by_id")
                return None
            return collection.find_one({'_id': ObjectId(user_id)})
        except Exception as e:
            logger.error(f"Error en find_by_id: {str(e)}", exc_info=True)
            return None

    @staticmethod
    def verify_password(user, password):
        """Verifica la contraseña de un usuario"""
        try:
            return check_password_hash(user['password'], password)
        except Exception as e:
            logger.error(f"Error en verify_password: {str(e)}", exc_info=True)
            return False

    @staticmethod
    def update_last_login(user_id):
        """Actualiza el último login del usuario"""
        try:
            collection = User.get_collection()
            if collection is None:
                logger.error("La colección de usuarios es None en update_last_login")
                return
            collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {'lastLogin': datetime.utcnow()}}
            )
        except Exception as e:
            logger.error(f"Error en update_last_login: {str(e)}", exc_info=True)