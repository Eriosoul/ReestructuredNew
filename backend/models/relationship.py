from bson import ObjectId
from datetime import datetime
from utils.database import mongo

class Relationship:

    @staticmethod
    def get_collection():
        return mongo.db.relationships

    @staticmethod
    def create(data):
        data['firstObserved'] = data.get('firstObserved', datetime.utcnow())
        data['lastObserved'] = data.get('lastObserved', datetime.utcnow())
        collection = Relationship.get_collection()
        result = collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @staticmethod
    def find_all(filter={}):
        collection = Relationship.get_collection()
        rels = list(collection.find(filter))
        for r in rels:
            r['id'] = str(r['_id'])
            del r['_id']
        return rels

    @staticmethod
    def find_by_id(rel_id):
        collection = Relationship.get_collection()
        rel = collection.find_one({'_id': ObjectId(rel_id)})
        if rel:
            rel['id'] = str(rel['_id'])
            del rel['_id']
        return rel

    @staticmethod
    def update(rel_id, updates):
        updates['lastObserved'] = datetime.utcnow()
        collection = Relationship.get_collection()
        collection.update_one(
            {'_id': ObjectId(rel_id)},
            {'$set': updates}
        )
        return Relationship.find_by_id(rel_id)

    @staticmethod
    def delete(rel_id):
        collection = Relationship.get_collection()
        collection.delete_one({'_id': ObjectId(rel_id)})