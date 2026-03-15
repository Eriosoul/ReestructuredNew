from utils.database import mongo
from bson import ObjectId
from datetime import datetime

class Event:
    collection = mongo.db.events

    @staticmethod
    def create(data):
        data['timestamp'] = data.get('timestamp', datetime.utcnow())
        data['createdAt'] = datetime.utcnow()
        data['updatedAt'] = datetime.utcnow()
        # Valores por defecto
        if 'verified' not in data:
            data['verified'] = False
        if 'confidence' not in data:
            data['confidence'] = 50
        if 'severity' not in data:
            data['severity'] = 'medium'
        result = Event.collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @staticmethod
    def find_all(filter={}):
        events = list(Event.collection.find(filter).sort('timestamp', -1))
        for e in events:
            e['id'] = str(e['_id'])
            del e['_id']
        return events

    @staticmethod
    def find_by_id(event_id):
        event = Event.collection.find_one({'_id': ObjectId(event_id)})
        if event:
            event['id'] = str(event['_id'])
            del event['_id']
        return event

    @staticmethod
    def update(event_id, updates):
        updates['updatedAt'] = datetime.utcnow()
        Event.collection.update_one(
            {'_id': ObjectId(event_id)},
            {'$set': updates}
        )
        return Event.find_by_id(event_id)

    @staticmethod
    def delete(event_id):
        Event.collection.delete_one({'_id': ObjectId(event_id)})

    @staticmethod
    def mark_as_read(event_id):
        Event.collection.update_one(
            {'_id': ObjectId(event_id)},
            {'$set': {'verified': True}}
        )

    @staticmethod
    def mark_all_as_read(mission_id=None, object_id=None):
        filter = {'verified': False}
        if mission_id:
            filter['missionId'] = mission_id
        if object_id:
            filter['objectIds'] = object_id
        Event.collection.update_many(filter, {'$set': {'verified': True}})