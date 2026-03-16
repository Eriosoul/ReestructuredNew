# routes/units.py
from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required
from bson import ObjectId

from backend.utils.database import mongo

units_bp = Blueprint('units', __name__)


@units_bp.route('/api/units', methods=['GET'])
@jwt_required(optional=True)  # Puedes ponerlo opcional o requerido según tu política
def get_units():
    """
    Obtiene todas las unidades disponibles desde la base de datos.
    """
    try:
        # Acceder a la colección 'units' a través de la extensión PyMongo
        # Ajusta el nombre de la base de datos si es necesario
        units_collection = mongo.db.units

        # Proyectar solo los campos necesarios para el frontend
        # Incluye _id para tener un identificador único
        units = list(units_collection.find({}, {
            '_id': 1,
            'unitId': 1,
            'name': 1,
            'class': 1,
            'country': 1,
            'flag': 1,
            'type': 1,
            'role': 1,
            'status': 1,
            'sensors': 1,
            'armament': 1,
            # Añade aquí cualquier otro campo que necesites
        }))

        # Convertir ObjectId a string para que sea JSON serializable
        for unit in units:
            unit['_id'] = str(unit['_id'])

        return jsonify(units), 200
    except Exception as e:
        # En un entorno productivo, registra el error
        current_app.logger.error(f"Error al obtener unidades: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500