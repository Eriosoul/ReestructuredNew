from utils.database import mongo
from bson import ObjectId
from datetime import datetime

class Mission:
    collection = mongo.db.missions

    @staticmethod
    def create(data):
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        # Asegurar campos por defecto
        if 'status' not in data:
            data['status'] = 'pending'
        if 'activityLog' not in data:
            data['activityLog'] = []
        if 'notes' not in data:
            data['notes'] = []
        result = Mission.collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @staticmethod
    def find_all(filter={}):
        missions = list(Mission.collection.find(filter))
        for m in missions:
            m['id'] = str(m['_id'])
            del m['_id']
        return missions

    @staticmethod
    def find_by_id(mission_id):
        mission = Mission.collection.find_one({'_id': ObjectId(mission_id)})
        if mission:
            mission['id'] = str(mission['_id'])
            del mission['_id']
        return mission

    @staticmethod
    def update(mission_id, updates):
        updates['updatedAt'] = datetime.utcnow()
        Mission.collection.update_one(
            {'_id': ObjectId(mission_id)},
            {'$set': updates}
        )
        return Mission.find_by_id(mission_id)

    @staticmethod
    def delete(mission_id):
        Mission.collection.delete_one({'_id': ObjectId(mission_id)})