# backend/fix_mongo_index.py
from pymongo import MongoClient, errors
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fix_mongo_index():
    """Elimina el índice único de username de la colección users"""
    try:
        # Conectar a MongoDB
        client = MongoClient('mongodb://localhost:27017')
        db = client['intelops']
        collection = db['users']

        # Verificar índices actuales
        logger.info("📊 Índices actuales en users:")
        indexes = collection.index_information()
        for name, info in indexes.items():
            logger.info(f"  - {name}: {info['key']}")

        # Eliminar el índice username_1 si existe
        if 'username_1' in indexes:
            logger.info("🗑️ Eliminando índice username_1...")
            collection.drop_index('username_1')
            logger.info("✅ Índice username_1 eliminado")
        else:
            logger.info("ℹ️ El índice username_1 no existe")

        # Verificar índices después de eliminar
        logger.info("\n📊 Índices después de la operación:")
        indexes = collection.index_information()
        for name, info in indexes.items():
            logger.info(f"  - {name}: {info['key']}")

        # Si queremos crear un índice en email (opcional, recomendado)
        if 'email_1' not in indexes:
            logger.info("📧 Creando índice único en email...")
            collection.create_index('email', unique=True)
            logger.info("✅ Índice único en email creado")

        logger.info("\n✅ Todo listo! Ahora puedes registrar usuarios sin el campo username")

    except errors.OperationFailure as e:
        logger.error(f"❌ Error de operación en MongoDB: {e}")
    except Exception as e:
        logger.error(f"❌ Error inesperado: {e}")


if __name__ == '__main__':
    fix_mongo_index()