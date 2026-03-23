# In your create_app function (likely in backend/app.py or backend/__init__.py)
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from utils.database import init_db

# Import blueprints
from routes.auth import auth_bp
from routes.missions import missions_bp
from routes.objects import objects_bp
from routes.events import events_bp
from routes.graph import graph_bp
from routes.search import search_bp
from routes.notifications import notifications_bp
from routes.units import units_bp  # new

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS – allow your Next.js frontend origin
    CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])  # adjust ports

    jwt = JWTManager(app)
    mongo = init_db(app)  # assuming this sets up mongo

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(missions_bp, url_prefix='/api/missions')
    app.register_blueprint(objects_bp, url_prefix='/api/objects')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(graph_bp, url_prefix='/api/graph')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(units_bp)  # already includes /api/units prefix

    @app.route('/')
    def home():
        return "IntelOps API Running"

    return app