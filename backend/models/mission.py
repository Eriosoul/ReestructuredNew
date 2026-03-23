from bson import ObjectId
from datetime import datetime
from utils.database import mongo

class Mission:

    @staticmethod
    def get_collection():
        return mongo.db.missions

    @staticmethod
    def create(data):
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
        return data

    @staticmethod
    def find_all(filter={}):
        collection = Mission.get_collection()
        missions = list(collection.find(filter))
        for m in missions:
            m['id'] = str(m['_id'])
            del m['_id']
        return missions

    @staticmethod
    def find_by_id(mission_id):
        collection = Mission.get_collection()
        mission = collection.find_one({'_id': ObjectId(mission_id)})
        if mission:
            mission['id'] = str(mission['_id'])
            del mission['_id']
        return mission

    @staticmethod
    def update(mission_id, updates):
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
        collection.delete_one({'_id': ObjectId(mission_id)})