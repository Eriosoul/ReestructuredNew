import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from services.session_service import SessionService

auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # Validar datos requeridos
        if not data:
            return jsonify({'message': 'No se recibieron datos'}), 400

        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password or not name:
            return jsonify({'message': 'Email, password y name son requeridos'}), 400

        # Verificar si el usuario ya existe
        existing = User.find_by_email(email)
        if existing:
            logger.info(f"Intento de registro con email existente: {email}")
            return jsonify({'message': 'El usuario ya existe'}), 409

        # Crear usuario
        user = User.create(data)
        if not user:
            logger.error("User.create devolvió None")
            return jsonify({'message': 'Error al crear usuario en la base de datos'}), 500

        # Verificar que el usuario tiene _id
        if '_id' not in user:
            logger.error(f"El objeto usuario no contiene '_id': {user}")
            return jsonify({'message': 'Error al crear usuario: falta _id'}), 500

        # Preparar respuesta
        try:
            user_id = str(user['_id'])
            user_response = {
                'id': user_id,
                'email': user.get('email'),
                'name': user.get('name'),
                'role': user.get('role', 'analyst'),
                'permissions': user.get('permissions', []),
                'createdAt': user.get('createdAt').isoformat() if user.get('createdAt') else None
            }
        except Exception as e:
            logger.error(f"Error preparando respuesta: {str(e)}", exc_info=True)
            return jsonify({'message': 'Error procesando datos del usuario'}), 500

        # Generar token JWT
        try:
            token = create_access_token(identity=user_id)
        except Exception as e:
            logger.error(f"Error generando token: {str(e)}", exc_info=True)
            return jsonify({'message': 'Error generando token de autenticación'}), 500

        logger.info(f"Usuario registrado exitosamente: {email}")
        return jsonify({
            'user': user_response,
            'token': token
        }), 201

    except Exception as e:
        logger.exception("Excepción no controlada en registro")
        return jsonify({'message': 'Error interno del servidor', 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email y password requeridos'}), 400

        email = data.get('email')
        password = data.get('password')

        user = User.find_by_email(email)
        if not user or not User.verify_password(user, password):
            logger.info(f"Intento de login fallido para: {email}")
            return jsonify({'message': 'Credenciales inválidas'}), 401

        # Actualizar último login
        User.update_last_login(user['_id'])

        # Obtener IP y user agent
        ip = request.remote_addr
        user_agent = request.headers.get('User-Agent')

        # Crear sesión en base de datos
        session = SessionService.create_session(
            user_id=str(user['_id']),
            ip_address=ip,
            user_agent=user_agent
        )

        # Generar access token JWT (corto plazo)
        access_token = create_access_token(identity=str(user['_id']))

        # Preparar respuesta
        user_response = {
            'id': str(user['_id']),
            'email': user.get('email'),
            'name': user.get('name'),
            'role': user.get('role', 'analyst'),
            'permissions': user.get('permissions', []),
            'lastLogin': user.get('lastLogin').isoformat() if user.get('lastLogin') else None
        }

        logger.info(f"Usuario logueado exitosamente: {email} (sesión {session['session_token']})")
        return jsonify({
            'user': user_response,
            'access_token': access_token,
            'refresh_token': session['refresh_token'],
            'session_token': session['session_token']
        }), 200

    except Exception as e:
        logger.exception("Excepción no controlada en login")
        return jsonify({'message': 'Error interno del servidor', 'error': str(e)}), 500


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        if not refresh_token:
            return jsonify({'message': 'Refresh token requerido'}), 400

        session = SessionService.get_session_by_refresh_token(refresh_token)
        if not session:
            return jsonify({'message': 'Sesión inválida o expirada'}), 401

        # Actualizar actividad de la sesión
        SessionService.update_activity(session['session_token'])

        # Generar nuevo access token
        new_access_token = create_access_token(identity=str(session['user_id']))

        logger.info(f"Token refrescado para usuario {session['user_id']} (sesión {session['session_token']})")
        return jsonify({'access_token': new_access_token}), 200

    except Exception as e:
        logger.exception("Excepción no controlada en refresh")
        return jsonify({'message': 'Error interno del servidor', 'error': str(e)}), 500


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.find_by_id(current_user_id)

        if not user:
            return jsonify({'message': 'Usuario no encontrado'}), 404

        user_response = {
            'id': str(user['_id']),
            'email': user.get('email'),
            'name': user.get('name'),
            'role': user.get('role', 'analyst'),
            'permissions': user.get('permissions', []),
            'createdAt': user.get('createdAt').isoformat() if user.get('createdAt') else None,
            'lastLogin': user.get('lastLogin').isoformat() if user.get('lastLogin') else None
        }

        return jsonify(user_response), 200

    except Exception as e:
        logger.exception("Excepción no controlada en profile")
        return jsonify({'message': 'Error interno del servidor', 'error': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Cierra la sesión del usuario. Requiere el session_token que se obtuvo en login.
    """
    try:
        data = request.get_json()
        session_token = data.get('session_token')
        if not session_token:
            return jsonify({'message': 'session_token requerido'}), 400

        # Invalidar sesión
        result = SessionService.invalidate_session(session_token)
        if result.modified_count == 0:
            return jsonify({'message': 'Sesión no encontrada o ya inactiva'}), 404

        logger.info(f"Sesión cerrada: {session_token}")
        return jsonify({'message': 'Sesión cerrada exitosamente'}), 200

    except Exception as e:
        logger.exception("Excepción no controlada en logout")
        return jsonify({'message': 'Error interno del servidor', 'error': str(e)}), 500