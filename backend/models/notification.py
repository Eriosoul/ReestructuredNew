from utils.database import mongo
from bson import ObjectId
from datetime import datetime

class Notification:
    collection = mongo.db.notifications

    @staticmethod
    def create(data):
        data['timestamp'] = datetime.utcnow()
        data['read'] = False
        result = Notification.collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @staticmethod
    def find_by_user(user_id, limit=50):
        notifs = list(Notification.collection.find(
            {'userId': user_id}
        ).sort('timestamp', -1).limit(limit))
        for n in notifs:
            n['id'] = str(n['_id'])
            del n['_id']
        return notifs

    @staticmethod
    def mark_as_read(notif_id):
        Notification.collection.update_one(
            {'_id': ObjectId(notif_id)},
            {'$set': {'read': True}}
        )

    @staticmethod
    def mark_all_read(user_id):
        Notification.collection.update_many(
            {'userId': user_id, 'read': False},
            {'$set': {'read': True}}
        )