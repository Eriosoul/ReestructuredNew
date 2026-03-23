# backend/routes/hostile.py
from flask import Blueprint, jsonify, request
from utils.database import mongo
from bson import ObjectId
from utils.assets import get_assets_for_unit, load_assets
from datetime import datetime

hostile_bp = Blueprint('hostile', __name__)

# 🔴 GET ALL HOSTILE UNITS
@hostile_bp.route('/api/hostile', methods=['GET'])
def get_hostile_units():
    try:
        domain = request.args.get('domain')
        query = {}
        if domain:
            query['domain'] = domain

        units = list(mongo.db.hostile.find(query))

        print(f"📊 Unidades hostiles cargadas: {len(units)}")

        assets = load_assets()

        for unit in units:
            unit['_id'] = str(unit['_id'])

            try:
                images, videos = get_assets_for_unit(unit, assets)
            except Exception as e:
                print(f"❌ Error assets {unit.get('name', 'Unknown')}: {e}")
                images, videos = [], []

            unit['images'] = images
            unit['videos'] = videos

        return jsonify(units), 200

    except Exception as e:
        print(f"💥 Error crítico en /api/hostile: {e}")
        return jsonify({'error': str(e)}), 500


# 🔴 GET MISSIONS FOR UNIT
@hostile_bp.route('/api/hostile/<unit_id>/missions', methods=['GET'])
def get_hostile_missions(unit_id):
    try:
        missions = list(mongo.db.missions.find(
            {'units.unitId': unit_id},
            {'name': 1, 'status': 1, 'startDate': 1, 'endDate': 1, 'description': 1}
        ))

        for m in missions:
            m['_id'] = str(m['_id'])

        print(f"🎯 Misiones para unidad {unit_id}: {len(missions)}")
        return jsonify(missions), 200

    except Exception as e:
        print(f"💥 Error en missions: {e}")
        return jsonify({'error': str(e)}), 500


# 🔴 CREATE HOSTILE UNIT
@hostile_bp.route('/api/hostile', methods=['POST'])
def create_hostile_unit():
    try:
        data = request.get_json()

        required_fields = ['unitId', 'name', 'country', 'domain']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Campo obligatorio: {field}'}), 400

        unit = {
            'unitId': data['unitId'],
            'name': data['name'],
            'country': data['country'],
            'flag': data.get('flag', ''),
            'domain': data['domain'],
            'status': data.get('status', 'activo'),
            'type': data.get('type', ''),
            'role': data.get('role', ''),
            'class': data.get('class', ''),
            'identifiers': data.get('identifiers', {}),
            'builder': data.get('builder'),
            'displacement': data.get('displacement'),
            'dimensions': data.get('dimensions'),
            'propulsion': data.get('propulsion'),
            'performance': data.get('performance'),
            'complement': data.get('complement'),
            'aviation': data.get('aviation'),
            'amphibious': data.get('amphibious'),
            'armament': data.get('armament', []),
            'sensors': data.get('sensors', []),
            'countermeasures': data.get('countermeasures', []),
            'communications': data.get('communications'),
            'homeport': data.get('homeport'),
            'currentBase': data.get('currentBase'),
            'fleet': data.get('fleet'),
            'squadron': data.get('squadron'),
            'history': data.get('history', {
                'keelLaid': None,
                'launched': None,
                'commissioned': None,
                'decommissioned': None,
                'majorEvents': []
            }),
            'metadata': {
                'sources': data.get('metadata', {}).get('sources', ['Usuario']),
                'lastUpdated': datetime.utcnow().isoformat(),
                'dataQuality': data.get('metadata', {}).get('dataQuality', 'media')
            },
            'images': data.get('images', []),
            'videos': data.get('videos', [])
        }

        # limpiar campos vacíos
        unit = {k: v for k, v in unit.items() if v not in [None, {}, []]}

        result = mongo.db.hostile.insert_one(unit)
        unit['_id'] = str(result.inserted_id)

        print(f"✅ Hostile creado: {unit['name']} ({unit['unitId']})")
        return jsonify(unit), 201

    except Exception as e:
        print(f"💥 Error creando hostile: {e}")
        return jsonify({'error': str(e)}), 500


# 🔴 GET ONE HOSTILE UNIT
@hostile_bp.route('/api/hostile/<unit_id>', methods=['GET'])
def get_hostile_unit(unit_id):
    try:
        unit = mongo.db.hostile.find_one({'_id': ObjectId(unit_id)})
        if not unit:
            return jsonify({'error': 'Unidad no encontrada'}), 404

        unit['_id'] = str(unit['_id'])

        assets = load_assets()
        images, videos = get_assets_for_unit(unit, assets)

        unit['images'] = images
        unit['videos'] = videos

        return jsonify(unit), 200

    except Exception as e:
        print(f"💥 Error obteniendo unidad: {e}")
        return jsonify({'error': str(e)}), 500


# 🔴 UPDATE HOSTILE UNIT
@hostile_bp.route('/api/hostile/<unit_id>', methods=['PUT'])
def update_hostile_unit(unit_id):
    try:
        data = request.get_json()

        unit = mongo.db.hostile.find_one({'_id': ObjectId(unit_id)})
        if not unit:
            return jsonify({'error': 'Unidad no encontrada'}), 404

        update_data = {
            'unitId': data.get('unitId', unit['unitId']),
            'name': data.get('name', unit['name']),
            'country': data.get('country', unit['country']),
            'flag': data.get('flag', unit.get('flag', '')),
            'domain': data.get('domain', unit['domain']),
            'status': data.get('status', unit.get('status', 'activo')),
            'type': data.get('type', unit.get('type', '')),
            'role': data.get('role', unit.get('role', '')),
            'class': data.get('class', unit.get('class', '')),
            'identifiers': data.get('identifiers', unit.get('identifiers', {})),
            'builder': data.get('builder', unit.get('builder')),
            'displacement': data.get('displacement', unit.get('displacement')),
            'dimensions': data.get('dimensions', unit.get('dimensions')),
            'propulsion': data.get('propulsion', unit.get('propulsion')),
            'performance': data.get('performance', unit.get('performance')),
            'complement': data.get('complement', unit.get('complement')),
            'aviation': data.get('aviation', unit.get('aviation')),
            'amphibious': data.get('amphibious', unit.get('amphibious')),
            'armament': data.get('armament', unit.get('armament', [])),
            'sensors': data.get('sensors', unit.get('sensors', [])),
            'countermeasures': data.get('countermeasures', unit.get('countermeasures', [])),
            'communications': data.get('communications', unit.get('communications')),
            'homeport': data.get('homeport', unit.get('homeport')),
            'currentBase': data.get('currentBase', unit.get('currentBase')),
            'fleet': data.get('fleet', unit.get('fleet')),
            'squadron': data.get('squadron', unit.get('squadron')),
            'history': data.get('history', unit.get('history')),
            'metadata': {
                'sources': data.get('metadata', {}).get('sources',
                    unit.get('metadata', {}).get('sources', ['Usuario'])),
                'lastUpdated': datetime.utcnow().isoformat(),
                'dataQuality': data.get('metadata', {}).get('dataQuality',
                    unit.get('metadata', {}).get('dataQuality', 'media'))
            },
            'images': data.get('images', unit.get('images', [])),
            'videos': data.get('videos', unit.get('videos', []))
        }

        update_data = {k: v for k, v in update_data.items() if v is not None}

        result = mongo.db.hostile.update_one(
            {'_id': ObjectId(unit_id)},
            {'$set': update_data}
        )

        if result.modified_count > 0:
            updated = mongo.db.hostile.find_one({'_id': ObjectId(unit_id)})
            updated['_id'] = str(updated['_id'])

            print(f"✅ Hostile actualizado: {updated['name']}")
            return jsonify(updated), 200
        else:
            return jsonify({'message': 'No cambios'}), 200

    except Exception as e:
        print(f"💥 Error actualizando: {e}")
        return jsonify({'error': str(e)}), 500


@hostile_bp.route('/api/hostile/<unit_id>', methods=['DELETE'])
def delete_hostile_unit(unit_id):
    try:
        result = mongo.db.hostile.delete_one({'_id': ObjectId(unit_id)})
        if result.deleted_count == 0:
            return jsonify({'error': 'Unidad hostil no encontrada'}), 404

        print(f"🗑️ Hostile eliminado: {unit_id}")
        return jsonify({'message': 'Unidad hostil eliminada correctamente'}), 200

    except Exception as e:
        print(f"💥 Error eliminando hostile: {e}")
        return jsonify({'error': str(e)}), 500