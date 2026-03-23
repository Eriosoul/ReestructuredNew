from bson import ObjectId
from datetime import datetime
from utils.database import mongo

class TargetObject:

    @staticmethod
    def get_collection():
        return mongo.db.objects

    @staticmethod
    def create(data):
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        if 'status' not in data:
            data['status'] = 'active'
        if 'confidence' not in data:
            data['confidence'] = 50
        if 'riskScore' not in data:
            data['riskScore'] = 0
        if 'timeline' not in data:
            data['timeline'] = []
        if 'predictions' not in data:
            data['predictions'] = []
        if 'relationships' not in data:
            data['relationships'] = []
        if 'media' not in data:
            data['media'] = []
        if 'notes' not in data:
            data['notes'] = []
        collection = TargetObject.get_collection()
        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @staticmethod
    def find_all(filter={}):
        collection = TargetObject.get_collection()
        objects = list(collection.find(filter))
        for o in objects:
            o['id'] = str(o['_id'])
            del o['_id']
        return objects

    @staticmethod
    def find_by_id(obj_id):
        collection = TargetObject.get_collection()
        obj = collection.find_one({'_id': ObjectId(obj_id)})
        if obj:
            obj['id'] = str(obj['_id'])
            del obj['_id']
        return obj

    @staticmethod
    def update(obj_id, updates):
        updates['updatedAt'] = datetime.utcnow()
        collection = TargetObject.get_collection()
        collection.update_one(
            {'_id': ObjectId(obj_id)},
            {'$set': updates}
        )
        return TargetObject.find_by_id(obj_id)

    @staticmethod
    def delete(obj_id):
        collection = TargetObject.get_collection()
        collection.delete_one({'_id': ObjectId(obj_id)})

    @staticmethod
    def add_to_watchlist(obj_id):
        collection = TargetObject.get_collection()
        collection.update_one(
            {'_id': ObjectId(obj_id)},
            {'$set': {'status': 'watchlisted'}}
        )

    @staticmethod
    def remove_from_watchlist(obj_id):
        collection = TargetObject.get_collection()
        collection.update_one(
            {'_id': ObjectId(obj_id)},
            {'$set': {'status': 'active'}}
        )

    @staticmethod
    def add_timeline_event(obj_id, event_data):
        collection = TargetObject.get_collection()
        collection.update_one(
            {'_id': ObjectId(obj_id)},
            {'$push': {'timeline': {'$each': [event_data], '$position': 0}}}
        )

    @staticmethod
    def add_prediction(obj_id, prediction_data):
        collection = TargetObject.get_collection()
        collection.update_one(
            {'_id': ObjectId(obj_id)},
            {'$push': {'predictions': {'$each': [prediction_data], '$position': 0}}}
        )

    @staticmethod
    def update_last_location(obj_id, location):
        collection = TargetObject.get_collection()
        collection.update_one(
            {'_id': ObjectId(obj_id)},
            {'$set': {
                'lastKnownLocation': location,
                'lastSeenAt': datetime.utcnow()
            }}
        )