from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.mission import Mission
from models.object import TargetObject
from models.event import Event

search_bp = Blueprint('search', __name__)

@search_bp.route('/', methods=['GET'])
@jwt_required()
def search():
    query = request.args.get('q', '')
    if not query or len(query) < 2:
        return jsonify([]), 200

    # Búsqueda en múltiples colecciones (puedes usar text index en MongoDB)
    # Ejemplo simple con regex (no eficiente para producción)
    import re
    regex = re.compile(f'.*{re.escape(query)}.*', re.IGNORECASE)
    
    missions = list(Mission.collection.find({'name': regex}))
    objects = list(TargetObject.collection.find({'name': regex}))
    events = list(Event.collection.find({'title': regex}))
    
    # Formatear resultados
    results = []
    for m in missions:
        results.append({
            'id': str(m['_id']),
            'type': 'mission',
            'title': m['name'],
            'description': m.get('description', ''),
            'url': f'/missions/{m["_id"]}'
        })
    for o in objects:
        results.append({
            'id': str(o['_id']),
            'type': 'object',
            'title': o['name'],
            'description': o.get('description', ''),
            'url': f'/objects/{o["_id"]}'
        })
    # ... similar para eventos
    
    return jsonify(results), 200