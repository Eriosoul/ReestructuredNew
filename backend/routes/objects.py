from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.object import TargetObject
from bson import ObjectId

objects_bp = Blueprint('objects', __name__)

@objects_bp.route('/', methods=['GET'])
@jwt_required()
def get_objects():
    filters = {}
    if request.args.get('type'):
        filters['type'] = request.args['type']
    if request.args.get('status'):
        filters['status'] = request.args['status']
    if request.args.get('missionId'):
        filters['missions'] = request.args['missionId']  # asume array de mission ids
    if request.args.get('confidence_min'):
        filters['confidence'] = {'$gte': int(request.args['confidence_min'])}
    if request.args.get('confidence_max'):
        filters.setdefault('confidence', {})['$lte'] = int(request.args['confidence_max'])
    # Búsqueda por texto (simple)
    if request.args.get('search'):
        import re
        regex = re.compile(f'.*{re.escape(request.args["search"])}.*', re.IGNORECASE)
        filters['$or'] = [
            {'name': regex},
            {'aliases': regex},
            {'description': regex}
        ]
    objects = TargetObject.find_all(filters)
    return jsonify(objects), 200

@objects_bp.route('/<object_id>', methods=['GET'])
@jwt_required()
def get_object(object_id):
    obj = TargetObject.find_by_id(object_id)
    if not obj:
        return jsonify({'message': 'Objeto no encontrado'}), 404
    return jsonify(obj), 200

@objects_bp.route('/', methods=['POST'])
@jwt_required()
def create_object():
    data = request.get_json()
    if not data.get('name') or not data.get('type'):
        return jsonify({'message': 'Faltan campos requeridos (name, type)'}), 400
    new_obj = TargetObject.create(data)
    new_obj['id'] = str(new_obj['_id'])
    del new_obj['_id']
    return jsonify(new_obj), 201

@objects_bp.route('/<object_id>', methods=['PUT'])
@jwt_required()
def update_object(object_id):
    data = request.get_json()
    updated = TargetObject.update(object_id, data)
    if not updated:
        return jsonify({'message': 'Objeto no encontrado'}), 404
    return jsonify(updated), 200

@objects_bp.route('/<object_id>', methods=['DELETE'])
@jwt_required()
def delete_object(object_id):
    TargetObject.delete(object_id)
    return jsonify({'message': 'Objeto eliminado'}), 200

@objects_bp.route('/<object_id>/watchlist', methods=['POST'])
@jwt_required()
def add_to_watchlist(object_id):
    TargetObject.add_to_watchlist(object_id)
    return jsonify({'message': 'Añadido a watchlist'}), 200

@objects_bp.route('/<object_id>/watchlist', methods=['DELETE'])
@jwt_required()
def remove_from_watchlist(object_id):
    TargetObject.remove_from_watchlist(object_id)
    return jsonify({'message': 'Eliminado de watchlist'}), 200

@objects_bp.route('/<object_id>/timeline', methods=['POST'])
@jwt_required()
def add_timeline_event(object_id):
    event_data = request.get_json()
    if not event_data:
        return jsonify({'message': 'Datos del evento requeridos'}), 400
    TargetObject.add_timeline_event(object_id, event_data)
    return jsonify({'message': 'Evento añadido a timeline'}), 201

@objects_bp.route('/<object_id>/predictions', methods=['POST'])
@jwt_required()
def add_prediction(object_id):
    pred_data = request.get_json()
    if not pred_data:
        return jsonify({'message': 'Datos de predicción requeridos'}), 400
    TargetObject.add_prediction(object_id, pred_data)
    return jsonify({'message': 'Predicción añadida'}), 201

@objects_bp.route('/<object_id>/location', methods=['PATCH'])
@jwt_required()
def update_location(object_id):
    location = request.get_json()
    if not location or 'lat' not in location or 'lng' not in location:
        return jsonify({'message': 'Se requiere lat y lng'}), 400
    TargetObject.update_last_location(object_id, location)
    return jsonify({'message': 'Ubicación actualizada'}), 200