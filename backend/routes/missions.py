from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.mission import Mission
from models.operation import Operation   # <-- importar Operation para validar
from bson import ObjectId

missions_bp = Blueprint('missions', __name__)

@missions_bp.route('/', methods=['GET'])
@jwt_required()
def get_missions():
    filters = {}
    if request.args.get('status'):
        filters['status'] = request.args['status']
    if request.args.get('operation_id'):
        filters['operation_id'] = ObjectId(request.args['operation_id'])
    if request.args.get('parent_mission_id') is not None:
        # Si se envía 'null' como string, interpretarlo como None
        if request.args['parent_mission_id'] == 'null':
            filters['parent_mission_id'] = None
        else:
            filters['parent_mission_id'] = ObjectId(request.args['parent_mission_id'])
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
    user = get_jwt_identity()
    data['created_by'] = user

    # Validar que operation_id esté presente
    if 'operation_id' not in data:
        return jsonify({'error': 'operation_id is required'}), 400

    # Verificar que la operación existe
    if not Operation.find_by_id(data['operation_id']):
        return jsonify({'error': 'Operation not found'}), 404

    # Si se proporciona parent_mission_id, verificar que pertenezca a la misma operación
    if 'parent_mission_id' in data and data['parent_mission_id']:
        parent = Mission.find_by_id(data['parent_mission_id'])
        if not parent or parent['operation_id'] != data['operation_id']:
            return jsonify({'error': 'Parent mission not found or not in same operation'}), 400

    try:
        new_mission = Mission.create(data)
        return jsonify(new_mission), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

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

# Nuevo endpoint: obtener submisiones de una misión
@missions_bp.route('/<mission_id>/submissions', methods=['GET'])
@jwt_required()
def get_submissions(mission_id):
    submissions = Mission.find_submissions(mission_id)
    return jsonify(submissions), 200