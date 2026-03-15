from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models.object import TargetObject
from models.relationship import Relationship  # necesitas crear este modelo

graph_bp = Blueprint('graph', __name__)

@graph_bp.route('/', methods=['GET'])
@jwt_required()
def get_graph():
    objects = TargetObject.find_all()
    relationships = Relationship.find_all()  # método a implementar
    
    nodes = []
    for obj in objects:
        nodes.append({
            'id': obj['id'],
            'label': obj['name'],
            'type': obj['type'],
            'size': obj.get('riskScore', 50) / 10,
            'color': get_color_by_status(obj.get('status')),
            'icon': get_icon_by_type(obj['type']),
            'data': obj
        })
    
    edges = []
    for rel in relationships:
        edges.append({
            'id': rel['id'],
            'source': rel['sourceId'],
            'target': rel['targetId'],
            'type': rel['type'],
            'weight': rel.get('strength', 1) * 5,
            'confidence': rel.get('confidence', 50),
            'directed': rel['type'] in ['ownership', 'colleague'],
            'color': get_edge_color(rel.get('confidence', 50))
        })
    
    return jsonify({'nodes': nodes, 'edges': edges}), 200

def get_color_by_status(status):
    colors = {'watchlisted': '#ef4444', 'flagged': '#f59e0b', 'active': '#3b82f6'}
    return colors.get(status, '#6b7280')

def get_icon_by_type(type):
    icons = {'person': 'user', 'vehicle': 'truck', 'vessel': 'ship', 'location': 'mapPin'}
    return icons.get(type, 'circle')

def get_edge_color(confidence):
    if confidence > 90: return '#10b981'
    if confidence > 70: return '#3b82f6'
    return '#6b7280'