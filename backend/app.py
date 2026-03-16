# En el archivo donde defines create_app (ej. app.py o __init__.py)
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from utils.database import init_db

# Importa los blueprints existentes
from routes.auth import auth_bp
from routes.missions import missions_bp
from routes.objects import objects_bp
from routes.events import events_bp
from routes.graph import graph_bp
from routes.search import search_bp
from routes.notifications import notifications_bp

# Importa el nuevo blueprint de units
from routes.units import units_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar extensiones
    # Ajusta el origen CORS para incluir el puerto de tu frontend Next.js (ej. 3000)
    CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])  # Agrega el puerto 3000

    jwt = JWTManager(app)
    mongo = init_db(app)  # Esto probablemente guarda la instancia en app.extensions o similar

    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(missions_bp, url_prefix='/api/missions')
    app.register_blueprint(objects_bp, url_prefix='/api/objects')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(graph_bp, url_prefix='/api/graph')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    # Registrar nuevo blueprint de units
    app.register_blueprint(units_bp)  # Ya tiene /api/units en su definición

    @app.route('/')
    def home():
        return "IntelOps API Running"

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)