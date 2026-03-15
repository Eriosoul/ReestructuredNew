from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.mission import Mission
from bson import ObjectId

missions_bp = Blueprint('missions', __name__)

@missions_bp.route('/', methods=['GET'])
@jwt_required()
def get_missions():
    # Aquí podrías aplicar filtros desde query params
    filters = {}
    # Ejemplo: ?status=active
    if request.args.get('status'):
        filters['status'] = request.args['status']
    missions = Mission.find_all(filters)
    return jsonify(missions), 200

@missions_bp.route('/<mission_id>', methods=['GET'])
@jwt_required()
def get_mission(mission_id):
    mission = Mission.find_by_id(mission_id)
    if not mission:
        return jsonify({'message': 'Misión no encontrada'}), 404
    return jsonify(mission), 200

@missions_bp.route('/', methods=['POST'])
@jwt_required()
def create_mission():
    data = request.get_json()
    # Aquí podrías validar campos obligatorios
    new_mission = Mission.create(data)
    new_mission['id'] = str(new_mission['_id'])
    del new_mission['_id']
    return jsonify(new_mission), 201

@missions_bp.route('/<mission_id>', methods=['PUT'])
@jwt_required()
def update_mission(mission_id):
    data = request.get_json()
    updated = Mission.update(mission_id, data)
    if not updated:
        return jsonify({'message': 'Misión no encontrada'}), 404
    return jsonify(updated), 200

@missions_bp.route('/<mission_id>', methods=['DELETE'])
@jwt_required()
def delete_mission(mission_id):
    Mission.delete(mission_id)
    return jsonify({'message': 'Misión eliminada'}), 200