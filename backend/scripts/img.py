# migrations/normalize_multimedia.py
"""
Script de migración única para normalizar los campos 'images' y 'videos' en la colección 'units'.
Convierte entradas antiguas (strings sueltos) a objetos con estructura correcta:
{
    "filename": str,
    "title": str (opcional),
    "uploadedAt": datetime,
    "order": int
}
Ejecútalo una sola vez con: python migrations/normalize_multimedia.py
"""

from datetime import datetime
from bson.objectid import ObjectId
from ..utils.database import mongo

def normalize_multimedia():
    print("=== Iniciando migración de normalización de images y videos ===")
    print(f"Fecha de ejecución: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")

    # Bandera para saber si ya se ejecutó esta migración
    migration_name = "normalize_images_videos_2026_03_17"
    existing_migration = mongo.db.migrations.find_one({"name": migration_name})

    if existing_migration:
        print(f"Esta migración ya se ejecutó el {existing_migration['doneAt']}. Nada que hacer.")
        print(f"Documentos actualizados en esa ocasión: {existing_migration.get('updated_docs', 'desconocido')}")
        return

    updated_count = 0
    total_docs = mongo.db.units.count_documents({})
    print(f"Total de documentos en 'units': {total_docs}")

    # Procesar images
    print("\nProcesando campo 'images'...")
    units_images = mongo.db.units.find({"images": {"$type": "array"}})

    for unit in units_images:
        updated_images = []
        original_images = unit.get("images", [])

        for idx, img in enumerate(original_images):
            if isinstance(img, str):
                # Caso antiguo: solo filename como string
                updated_images.append({
                    "filename": img,
                    "title": "",
                    "uploadedAt": datetime.utcnow(),
                    "order": idx
                })
            elif isinstance(img, dict):
                # Ya es dict → normalizamos campos faltantes
                updated_images.append({
                    "filename": img.get("filename", ""),
                    "title": img.get("title", ""),
                    "uploadedAt": img.get("uploadedAt", datetime.utcnow()),
                    "order": img.get("order", idx)
                })
            else:
                # Formato raro → lo ignoramos y logueamos
                print(f"Formato desconocido ignorado en unit {unit.get('unitId', unit['_id'])} → {img}")
                continue

        # Solo actualizamos si hay cambios
        if updated_images != original_images:
            mongo.db.units.update_one(
                {"_id": unit["_id"]},
                {"$set": {"images": updated_images}}
            )
            updated_count += 1
            print(f"  → Actualizado 'images' en unit: {unit.get('unitId', unit['_id'])} "
                  f"({len(updated_images)} elementos)")

    # Procesar videos (exactamente igual, pero con campo "videos")
    print("\nProcesando campo 'videos'...")
    units_videos = mongo.db.units.find({"videos": {"$type": "array"}})

    for unit in units_videos:
        updated_videos = []
        original_videos = unit.get("videos", [])

        for idx, vid in enumerate(original_videos):
            if isinstance(vid, str):
                updated_videos.append({
                    "filename": vid,
                    "title": "",
                    "uploadedAt": datetime.utcnow(),
                    "order": idx
                })
            elif isinstance(vid, dict):
                updated_videos.append({
                    "filename": vid.get("filename", ""),
                    "title": vid.get("title", ""),
                    "duration": vid.get("duration"),
                    "uploadedAt": vid.get("uploadedAt", datetime.utcnow()),
                    "order": vid.get("order", idx)
                })
            else:
                print(f"Formato desconocido ignorado en unit {unit.get('unitId', unit['_id'])} → {vid}")
                continue

        if updated_videos != original_videos:
            mongo.db.units.update_one(
                {"_id": unit["_id"]},
                {"$set": {"videos": updated_videos}}
            )
            updated_count += 1
            print(f"  → Actualizado 'videos' en unit: {unit.get('unitId', unit['_id'])} "
                  f"({len(updated_videos)} elementos)")

    # Registrar que la migración se completó
    mongo.db.migrations.insert_one({
        "name": migration_name,
        "doneAt": datetime.utcnow(),
        "updated_docs": updated_count,
        "note": "Normalización de arrays images y videos a estructura con filename/title/uploadedAt/order"
    })

    print(f"\n=== Migración completada ===")
    print(f"Documentos procesados/actualizados: {updated_count}")
    print(f"Fecha final: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")


if __name__ == "__main__":
    try:
        from app import app  # Asegúrate de que app.py tenga: from database import mongo

        with app.app_context():
            normalize_multimedia()
    except ImportError as e:
        print("Error: No se pudo importar 'app'. Asegúrate de que app.py exista y exporte 'app'.")
        print("Alternativa: ejecuta este script desde mongosh o Compass manualmente.")
    except Exception as e:
        print(f"Error durante la migración: {str(e)}")