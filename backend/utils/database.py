from flask_pymongo import PyMongo
import logging

logger = logging.getLogger(__name__)
mongo = PyMongo()


def init_db(app):
    """Inicializa la conexión a MongoDB"""
    try:
        # Asegurar que la URI está configurada
        if not app.config.get('MONGO_URI'):
            logger.error("MONGO_URI no está configurada")
            raise ValueError("MONGO_URI no está configurada")

        logger.info(f"Conectando a MongoDB: {app.config['MONGO_URI']}")
        mongo.init_app(app)

        # Verificar conexión
        with app.app_context():
            # Intentar listar bases de datos para verificar conexión
            db_names = mongo.db.client.list_database_names()
            logger.info(f"✅ Conectado a MongoDB. Bases de datos disponibles: {db_names}")

            # Verificar/crear colección users
            if 'users' not in mongo.db.list_collection_names():
                logger.info("Creando colección 'users'...")
                mongo.db.create_collection('users')

        return mongo
    except Exception as e:
        logger.error(f"❌ Error conectando a MongoDB: {e}")
        logger.error("Verifica que MongoDB esté instalado y corriendo en localhost:27017")
        raise e