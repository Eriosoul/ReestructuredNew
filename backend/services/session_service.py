# services/session_service.py
import uuid
from datetime import datetime, timedelta
from bson import ObjectId
from utils.database import mongo
import logging

logger = logging.getLogger(__name__)

class SessionService:
    @staticmethod
    def get_collection():
        return mongo.db.sessions

    @staticmethod
    def create_session(user_id, ip_address=None, user_agent=None):
        """
        Crea una nueva sesión para el usuario.
        Retorna el objeto sesión creado.
        """
        now = datetime.utcnow()
        expires_at = now + timedelta(days=7)  # 7 días de vida para la sesión
        session_data = {
            'user_id': ObjectId(user_id),
            'session_token': str(uuid.uuid4()),
            'refresh_token': str(uuid.uuid4()),
            'ip_address': ip_address,
            'user_agent': user_agent,
            'created_at': now,
            'expires_at': expires_at,
            'last_activity': now,
            'is_active': True,
            'logout_at': None
        }
        result = SessionService.get_collection().insert_one(session_data)
        session_data['_id'] = result.inserted_id
        return session_data

    @staticmethod
    def get_session_by_refresh_token(refresh_token):
        """Obtiene una sesión por refresh_token, siempre que esté activa y no expirada."""
        return SessionService.get_collection().find_one({
            'refresh_token': refresh_token,
            'is_active': True,
            'logout_at': None,
            'expires_at': {'$gt': datetime.utcnow()}
        })

    @staticmethod
    def get_session_by_session_token(session_token):
        return SessionService.get_collection().find_one({
            'session_token': session_token,
            'is_active': True,
            'logout_at': None,
            'expires_at': {'$gt': datetime.utcnow()}
        })

    @staticmethod
    def invalidate_session(session_token):
        """Marca la sesión como inactiva (logout)."""
        return SessionService.get_collection().update_one(
            {'session_token': session_token},
            {'$set': {'is_active': False, 'logout_at': datetime.utcnow()}}
        )

    @staticmethod
    def update_activity(session_token):
        """Actualiza el último momento de actividad de la sesión."""
        return SessionService.get_collection().update_one(
            {'session_token': session_token},
            {'$set': {'last_activity': datetime.utcnow()}}
        )

    @staticmethod
    def revoke_all_user_sessions(user_id):
        """Revoca todas las sesiones activas de un usuario (útil en cambio de contraseña)."""
        return SessionService.get_collection().update_many(
            {'user_id': ObjectId(user_id), 'is_active': True},
            {'$set': {'is_active': False, 'logout_at': datetime.utcnow()}}
        )