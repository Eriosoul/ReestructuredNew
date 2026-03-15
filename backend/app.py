from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from utils.database import init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Inicializar extensiones
    CORS(app, origins=["http://localhost:5173"])  # Ajusta según tu frontend
    jwt = JWTManager(app)
    mongo = init_db(app)
    
    # Registrar blueprints
    from routes.auth import auth_bp
    from routes.missions import missions_bp
    from routes.objects import objects_bp
    from routes.events import events_bp
    from routes.graph import graph_bp
    from routes.search import search_bp
    from routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(missions_bp, url_prefix='/api/missions')
    app.register_blueprint(objects_bp, url_prefix='/api/objects')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(graph_bp, url_prefix='/api/graph')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    @app.route('/')
    def home():
        return "IntelOps API Running"
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)