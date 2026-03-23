# backend/app.py
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from backend.routes.hosties import hostile_bp
from utils.database import init_db
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Importa los blueprints
from routes.auth import auth_bp
from routes.missions import missions_bp
from routes.objects import objects_bp
from routes.events import events_bp
from routes.graph import graph_bp
from routes.search import search_bp
from routes.notifications import notifications_bp
from routes.units import units_bp
from routes.upload import upload_bp
from backend.routes.operations import operations_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configuración CORS
    logger.info(f"Configurando CORS para orígenes: {Config.CORS_ORIGINS}")
    CORS(app, origins=Config.CORS_ORIGINS,
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"])

    # Inicializar JWT
    jwt = JWTManager(app)
    logger.info("JWT inicializado")

    # Manejadores de errores JWT (devuelven 401 con mensaje)
    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({'error': 'Missing token'}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return jsonify({'error': 'Invalid token'}), 401

    @jwt.expired_token_loader
    def expired_token_response(callback):
        return jsonify({'error': 'Token expired'}), 401

    @jwt.revoked_token_loader
    def revoked_token_response(callback):
        return jsonify({'error': 'Token revoked'}), 401

    # Inicializar MongoDB con verificación
    try:
        mongo = init_db(app)
        logger.info("✅ MongoDB inicializado correctamente")
    except Exception as e:
        logger.error(f"❌ Error inicializando MongoDB: {e}")

    # Ruta para servir archivos estáticos
    @app.route('/assets/<path:filename>')
    def serve_assets(filename):
        return send_from_directory('assets', filename)

    # Registrar blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(missions_bp, url_prefix='/api/missions')
    app.register_blueprint(operations_bp, url_prefix='/api/operations')
    app.register_blueprint(objects_bp, url_prefix='/api/objects')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(graph_bp, url_prefix='/api/graph')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(units_bp)
    app.register_blueprint(hostile_bp)
    app.register_blueprint(upload_bp)

    @app.route('/')
    def home():
        return "IntelOps API Running"

    return app


if __name__ == '__main__':
    app = create_app()
    logger.info("🚀 Servidor Flask iniciado en http://localhost:5000")
    app.run(debug=True, port=5000)