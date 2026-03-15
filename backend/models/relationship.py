from utils.database import mongo
from bson import ObjectId
from datetime import datetime

class Relationship:
    collection = mongo.db.relationships

    @staticmethod
    def create(data):
        data['firstObserved'] = data.get('firstObserved', datetime.utcnow())
        data['lastObserved'] = data.get('lastObserved', datetime.utcnow())
        result = Relationship.collection.insert_one(data)
        data['_id'] = result.inserted_id
        return data

    @staticmethod
    def find_all(filter={}):
        rels = list(Relationship.collection.find(filter))
        for r in rels:
            r['id'] = str(r['_id'])
            del r['_id']
        return rels

    @staticmethod
    def find_by_id(rel_id):
        rel = Relationship.collection.find_one({'_id': ObjectId(rel_id)})
        if rel:
            rel['id'] = str(rel['_id'])
            del rel['_id']
        return rel

    @staticmethod
    def update(rel_id, updates):
        updates['lastObserved'] = datetime.utcnow()
        Relationship.collection.update_one(
            {'_id': ObjectId(rel_id)},
            {'$set': updates}
        )
        return Relationship.find_by_id(rel_id)

    @staticmethod
    def delete(rel_id):
        Relationship.collection.delete_one({'_id': ObjectId(rel_id)})