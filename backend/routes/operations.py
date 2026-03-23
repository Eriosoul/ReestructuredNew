from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from backend.models.operation import Operation
from backend.models.mission import Mission

operations_bp = Blueprint('operations', __name__)

def serialize_operation(op_doc):
    """Convierte un documento de operación a JSON (convierte _id a string)"""
    if op_doc is None:
        return None
    op_doc['_id'] = str(op_doc['_id'])
    return op_doc

@operations_bp.route('/', methods=['GET'])
@jwt_required()
def get_operations():
    include_missions = request.args.get('include_missions', 'false').lower() == 'true'
    ops = Operation.find_all()
    result = []
    for op in ops:
        op = serialize_operation(op)
        if include_missions:
            missions = Mission.find_by_operation(op['_id'], include_submissions=True)
            op['missions'] = missions
        result.append(op)
    return jsonify(result), 200

@operations_bp.route('/', methods=['POST'])
@jwt_required()
def create_operation():
    auth_header = request.headers.get('Authorization')
    print("🔑 Header Authorization:", auth_header)
    data = request.get_json()
    print("📥 Datos recibidos en POST /api/operations/:", data)
    user = get_jwt_identity()
    data['created_by'] = user
    required = ['name', 'status', 'priority']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400
    op_id = Operation.create(data)
    return jsonify({'_id': op_id}), 201

@operations_bp.route('/<operation_id>', methods=['GET'])
@jwt_required()
def get_operation(operation_id):
    op = Operation.find_by_id(operation_id)
    if not op:
        return jsonify({'error': 'Operation not found'}), 404
    op = serialize_operation(op)
    return jsonify(op), 200

@operations_bp.route('/<operation_id>', methods=['PUT'])
@jwt_required()
def update_operation(operation_id):
    data = request.get_json()
    updated = Operation.update(operation_id, data)
    if not updated:
        return jsonify({'error': 'Operation not found or no changes'}), 404
    return jsonify({'message': 'Updated'}), 200

@operations_bp.route('/<operation_id>', methods=['DELETE'])
@jwt_required()
def delete_operation(operation_id):
    deleted = Operation.delete(operation_id)
    if not deleted:
        return jsonify({'error': 'Operation not found'}), 404
    return jsonify({'message': 'Deleted'}), 200

@operations_bp.route('/<operation_id>/missions', methods=['GET'])
@jwt_required()
def get_operation_missions(operation_id):
    missions = Mission.find_by_operation(operation_id, include_submissions=True)
    return jsonify(missions), 200