import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

IMAGES_PATH = os.path.join(BASE_DIR, "assets", "images")
VIDEOS_PATH = os.path.join(BASE_DIR, "assets", "videos")

# Configurable mediante variable de entorno
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')

def normalize(text):
    if not text:
        return ""
    return re.sub(r'[^a-z0-9]', '', text.lower())

def load_assets():
    try:
        print(f"🔍 Buscando imágenes en: {IMAGES_PATH}")
        print(f"🔍 Buscando videos en: {VIDEOS_PATH}")

        images = os.listdir(IMAGES_PATH) if os.path.exists(IMAGES_PATH) else []
        videos = os.listdir(VIDEOS_PATH) if os.path.exists(VIDEOS_PATH) else []

        print(f"📸 Imágenes encontradas: {images}")
        print(f"🎬 Videos encontrados: {videos}")

    except Exception as e:
        print("❌ Error cargando assets:", e)
        return {"images": [], "videos": []}

    return {"images": images, "videos": videos}

def get_assets_for_unit(unit, assets):
    try:
        db_images = unit.get('images', [])
        db_videos = unit.get('videos', [])

        print(f"📁 Imágenes en BD para {unit.get('name')}: {db_images}")
        print(f"📁 Videos en BD para {unit.get('name')}: {db_videos}")

        images = []
        videos = []

        for img_path in db_images:
            filename = os.path.basename(img_path)
            full_path = os.path.join(IMAGES_PATH, filename)
            if os.path.exists(full_path):
                images.append({
                    "url": f"{BACKEND_URL}/assets/images/{filename}",
                    "title": ""
                })
            else:
                print(f"  ❌ IMAGEN NO ENCONTRADA: {filename}")

        for vid_path in db_videos:
            filename = os.path.basename(vid_path)
            full_path = os.path.join(VIDEOS_PATH, filename)
            if os.path.exists(full_path):
                videos.append({
                    "url": f"{BACKEND_URL}/assets/videos/{filename}",
                    "title": ""
                })
            else:
                print(f"  ❌ VIDEO NO ENCONTRADO: {filename}")

        images.sort(key=lambda x: x["url"])
        videos.sort(key=lambda x: x["url"])

        print(f"✅ Total imágenes encontradas: {len(images)}")
        print(f"✅ Total videos encontrados: {len(videos)}")

        return images, videos

    except Exception as e:
        print("❌ Error en get_assets_for_unit:", e)
        return [], []