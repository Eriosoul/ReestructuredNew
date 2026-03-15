from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Email, password y name son requeridos'}), 400
    
    existing = User.find_by_email(data['email'])
    if existing:
        return jsonify({'message': 'El usuario ya existe'}), 409
    
    user = User.create(data)
    # Convertir ObjectId a string
    user['id'] = str(user['_id'])
    del user['_id']
    del user['password']  # no enviar la contraseña
    
    token = create_access_token(identity=str(user['id']))
    return jsonify({'user': user, 'token': token}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email y password requeridos'}), 400
    
    user = User.find_by_email(data['email'])
    if not user or not User.verify_password(user, data['password']):
        return jsonify({'message': 'Credenciales inválidas'}), 401
    
    # Actualizar último login
    User.update_last_login(user['_id'])
    
    user['id'] = str(user['_id'])
    del user['_id']
    del user['password']
    
    token = create_access_token(identity=str(user['id']))
    return jsonify({'user': user, 'token': token}), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    user = User.find_by_id(current_user_id)
    if not user:
        return jsonify({'message': 'Usuario no encontrado'}), 404
    
    user['id'] = str(user['_id'])
    del user['_id']
    del user['password']
    return jsonify(user), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # Si usas tokens blacklist, aquí se podría agregar lógica
    return jsonify({'message': 'Sesión cerrada'}), 200