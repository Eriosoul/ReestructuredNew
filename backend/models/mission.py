from bson import ObjectId
from datetime import datetime
from utils.database import mongo

class Mission:

    @staticmethod
    def get_collection():
        return mongo.db.missions

    @staticmethod
    def _convert_to_response(mission_doc):
        """Convierte un documento de MongoDB a la respuesta esperada (con 'id' en lugar de '_id')"""
        if mission_doc is None:
            return None
        mission_doc['id'] = str(mission_doc['_id'])
        # Convertir ObjectId a string para campos que los contengan
        if 'operation_id' in mission_doc and mission_doc['operation_id']:
            mission_doc['operation_id'] = str(mission_doc['operation_id'])
        if 'parent_mission_id' in mission_doc and mission_doc['parent_mission_id']:
            mission_doc['parent_mission_id'] = str(mission_doc['parent_mission_id'])
        del mission_doc['_id']
        return mission_doc

    @staticmethod
    def create(data):
        # Convertir operation_id a ObjectId (obligatorio)
        if 'operation_id' not in data:
            raise ValueError("operation_id is required")
        data['operation_id'] = ObjectId(data['operation_id'])

        # Convertir parent_mission_id si existe
        if 'parent_mission_id' in data and data['parent_mission_id']:
            data['parent_mission_id'] = ObjectId(data['parent_mission_id'])
        else:
            data['parent_mission_id'] = None

        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        if 'status' not in data:
            data['status'] = 'pending'
        if 'activityLog' not in data:
            data['activityLog'] = []
        if 'notes' not in data:
            data['notes'] = []

        collection = Mission.get_collection()
        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return Mission._convert_to_response(data)

    @staticmethod
    def find_all(filter={}):
        collection = Mission.get_collection()
        missions = list(collection.find(filter))
        return [Mission._convert_to_response(m) for m in missions]

    @staticmethod
    def find_by_id(mission_id):
        collection = Mission.get_collection()
        mission = collection.find_one({'_id': ObjectId(mission_id)})
        return Mission._convert_to_response(mission)

    @staticmethod
    def update(mission_id, updates):
        # Convertir operation_id si está presente
        if 'operation_id' in updates:
            updates['operation_id'] = ObjectId(updates['operation_id'])
        # Convertir parent_mission_id si está presente
        if 'parent_mission_id' in updates:
            if updates['parent_mission_id']:
                updates['parent_mission_id'] = ObjectId(updates['parent_mission_id'])
            else:
                updates['parent_mission_id'] = None

        updates['updatedAt'] = datetime.utcnow()
        collection = Mission.get_collection()
        collection.update_one(
            {'_id': ObjectId(mission_id)},
            {'$set': updates}
        )
        return Mission.find_by_id(mission_id)

    @staticmethod
    def delete(mission_id):
        collection = Mission.get_collection()
        # Eliminar recursivamente las submisiones (opcional)
        submissions = Mission.find_submissions(mission_id, raw=True)
        for sub in submissions:
            Mission.delete(str(sub['_id']))
        collection.delete_one({'_id': ObjectId(mission_id)})

    # ----- Nuevos métodos para jerarquía y operaciones -----
    @staticmethod
    def find_by_operation(operation_id, include_submissions=True, raw=False):
        """
        Obtiene las misiones de una operación.
        Si include_submissions=True, devuelve todas (incluyendo submisiones).
        Si include_submissions=False, devuelve solo las misiones raíz (parent_mission_id = None).
        Si raw=True, devuelve los documentos originales de MongoDB (con '_id').
        """
        collection = Mission.get_collection()
        query = {'operation_id': ObjectId(operation_id)}
        if not include_submissions:
            query['parent_mission_id'] = None
        missions = list(collection.find(query))
        if raw:
            return missions
        return [Mission._convert_to_response(m) for m in missions]

    @staticmethod
    def find_submissions(mission_id, raw=False):
        """
        Devuelve las submisiones directas de una misión.
        """
        collection = Mission.get_collection()
        submissions = list(collection.find({'parent_mission_id': ObjectId(mission_id)}))
        if raw:
            return submissions
        return [Mission._convert_to_response(s) for s in submissions]