from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.notification import Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifs = Notification.find_by_user(user_id)
    unread = sum(1 for n in notifs if not n['read'])
    return jsonify({
        'notifications': notifs,
        'unreadCount': unread
    }), 200

@notifications_bp.route('/<notif_id>/read', methods=['PATCH'])
@jwt_required()
def mark_read(notif_id):
    Notification.mark_as_read(notif_id)
    return jsonify({'message': 'OK'}), 200

@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_read():
    user_id = get_jwt_identity()
    Notification.mark_all_read(user_id)
    return jsonify({'message': 'OK'}), 200