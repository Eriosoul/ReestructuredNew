from bson import ObjectId
from datetime import datetime
from utils.database import mongo

class Notification:

    @staticmethod
    def get_collection():
        return mongo.db.notifications

    @staticmethod
    def create(data):
        data['createdAt'] = datetime.utcnow()
        data['read'] = False
        collection = Notification.get_collection()
        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @staticmethod
    def find_by_user(user_id):
        collection = Notification.get_collection()
        notifs = list(collection.find({'userId': user_id}).sort('createdAt', -1))
        for n in notifs:
            n['id'] = str(n['_id'])
            del n['_id']
        return notifs

    @staticmethod
    def mark_as_read(notif_id):
        collection = Notification.get_collection()
        collection.update_one(
            {'_id': ObjectId(notif_id)},
            {'$set': {'read': True}}
        )

    @staticmethod
    def mark_all_read(user_id):
        collection = Notification.get_collection()
        collection.update_many(
            {'userId': user_id, 'read': False},
            {'$set': {'read': True}}
        )