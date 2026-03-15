from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from models.object import TargetObject
from models.relationship import Relationship

# Crear el blueprint
graph_bp = Blueprint('graph', __name__)

@graph_bp.route('/', methods=['GET'])
@jwt_required()
def get_graph():
    """
    Endpoint para obtener los datos del grafo (nodos y aristas).
    Acepta filtros opcionales por query params.
    """
    # Obtener todos los objetos y relaciones
    objects = TargetObject.find_all()
    relationships = Relationship.find_all()

    # Construir nodos
    nodes = []
    for obj in objects:
        # Mapa de colores según estado
        color_map = {
            'active': '#3b82f6',
            'watchlisted': '#ef4444',
            'flagged': '#f59e0b',
            'archived': '#6b7280'
        }
        # Mapa de iconos según tipo
        icon_map = {
            'person': 'user',
            'vehicle': 'truck',
            'vessel': 'ship',
            'location': 'mapPin'
        }
        nodes.append({
            'id': obj['id'],
            'label': obj.get('name', 'Sin nombre'),
            'type': obj.get('type', 'unknown'),
            'size': (obj.get('riskScore', 50) / 10) + 5,
            'color': color_map.get(obj.get('status', ''), '#94a3b8'),
            'icon': icon_map.get(obj.get('type', ''), 'circle'),
            'data': obj
        })

    # Construir aristas
    edges = []
    for rel in relationships:
        confidence = rel.get('confidence', 50)
        if confidence > 90:
            color = '#10b981'
        elif confidence > 70:
            color = '#3b82f6'
        else:
            color = '#6b7280'

        edges.append({
            'id': rel['id'],
            'source': rel['sourceId'],
            'target': rel['targetId'],
            'type': rel.get('type', 'unknown'),
            'label': rel.get('type', ''),
            'weight': rel.get('strength', 1) * 5,
            'confidence': confidence,
            'directed': rel.get('type') in ['ownership', 'colleague'],
            'color': color
        })

    return jsonify({'nodes': nodes, 'edges': edges}), 200