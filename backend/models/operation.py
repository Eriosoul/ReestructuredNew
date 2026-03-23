from datetime import datetime
from bson import ObjectId
from utils.database import mongo

class Operation:
    COLLECTION = 'operations'

    @staticmethod
    def get_collection():
        return mongo.db.operations

    @staticmethod
    def create(data):
        data['created_at'] = datetime.utcnow()
        data['updated_at'] = datetime.utcnow()
        result = Operation.get_collection().insert_one(data)
        return str(result.inserted_id)

    @staticmethod
    def find_by_id(operation_id):
        return Operation.get_collection().find_one({'_id': ObjectId(operation_id)})

    @staticmethod
    def update(operation_id, data):
        data['updated_at'] = datetime.utcnow()
        result = Operation.get_collection().update_one(
            {'_id': ObjectId(operation_id)},
            {'$set': data}
        )
        return result.modified_count > 0

    @staticmethod
    def delete(operation_id):
        # Eliminar todas las misiones asociadas
        mongo.db.missions.delete_many({'operation_id': ObjectId(operation_id)})
        result = Operation.get_collection().delete_one({'_id': ObjectId(operation_id)})
        return result.deleted_count > 0

    @staticmethod
    def find_all(filter={}, limit=100, skip=0):
        return list(Operation.get_collection().find(filter).skip(skip).limit(limit))