from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.event import Event
from bson import ObjectId

events_bp = Blueprint('events', __name__)


@events_bp.route('/', methods=['GET'])
@jwt_required()
def get_events():
    # Filtros desde query params
    filters = {}
    if request.args.get('missionId'):
        filters['missionId'] = request.args['missionId']
    if request.args.get('objectId'):
        filters['objectIds'] = request.args['objectId']  # asume que objectIds es array
    if request.args.get('severity'):
        filters['severity'] = request.args['severity']
    if request.args.get('verified'):
        filters['verified'] = request.args['verified'].lower() == 'true'
    if request.args.get('start') and request.args.get('end'):
        # Filtro por rango de timestamp
        from datetime import datetime
        start = datetime.fromisoformat(request.args['start'].replace('Z', '+00:00'))
        end = datetime.fromisoformat(request.args['end'].replace('Z', '+00:00'))
        filters['timestamp'] = {'$gte': start, '$lte': end}

    events = Event.find_all(filters)
    return jsonify(events), 200


@events_bp.route('/<event_id>', methods=['GET'])
@jwt_required()
def get_event(event_id):
    event = Event.find_by_id(event_id)
    if not event:
        return jsonify({'message': 'Evento no encontrado'}), 404
    return jsonify(event), 200


@events_bp.route('/', methods=['POST'])
@jwt_required()
def create_event():
    data = request.get_json()
    # Validaciones básicas
    if not data.get('title') or not data.get('type'):
        return jsonify({'message': 'Faltan campos requeridos (title, type)'}), 400
    new_event = Event.create(data)
    new_event['id'] = str(new_event['_id'])
    del new_event['_id']
    return jsonify(new_event), 201


@events_bp.route('/<event_id>', methods=['PUT'])
@jwt_required()
def update_event(event_id):
    data = request.get_json()
    updated = Event.update(event_id, data)
    if not updated:
        return jsonify({'message': 'Evento no encontrado'}), 404
    return jsonify(updated), 200


@events_bp.route('/<event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    Event.delete(event_id)
    return jsonify({'message': 'Evento eliminado'}), 200


@events_bp.route('/<event_id>/read', methods=['PATCH'])
@jwt_required()
def mark_as_read(event_id):
    Event.mark_as_read(event_id)
    return jsonify({'message': 'OK'}), 200


@events_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_as_read():
    mission_id = request.args.get('missionId')
    object_id = request.args.get('objectId')
    Event.mark_all_as_read(mission_id, object_id)
    return jsonify({'message': 'OK'}), 200