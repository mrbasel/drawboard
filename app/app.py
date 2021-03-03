import os
import secrets
import time

from flask import Flask, request, render_template, url_for, redirect, flash
from redis import Redis
from redis.exceptions import ConnectionError
from flask_socketio import SocketIO, emit, leave_room
from flask_socketio import join_room as join_socket_room
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")
db = Redis()

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/room/<room_id>", methods=["GET"])
def draw_room(room_id):
    try:
        rooms = [i.decode("utf-8") for i in db.lrange("rooms", 0, -1)]
    except ConnectionError:
        flash("Something went wrong, please try again later.", "error")
        return redirect(url_for("home"))

    if room_id not in rooms:
        return redirect(url_for("home"))

    return render_template("draw_room.html")


@app.route("/room/form/create", methods=["POST"])
def create_room_form():
    if request.method == "POST":
        room_id = secrets.token_hex(8)

        try:
            rooms = [i.decode("utf-8") for i in db.lrange("rooms", 0, -1)]
        except ConnectionError:
            flash("Something went wrong, please try again later.", "error")
            return redirect(url_for("home"))

        while room_id in rooms:
            room_id = secrets.token_hex(8)

        db.rpush("rooms", room_id)

        return redirect(url_for("draw_room", room_id=room_id))
    else:
        return redirect(url_for("home"))


@socketio.on("client_disconnecting")
def on_client_disconnect(data):
    room_id = data.get("roomId")

    # Remove user's id from db
    db.lrem(f"{room_id}:users_ids", 1, request.sid)
    room_users_count = db.lrange(f"{room_id}:users_ids", 0, -1)

    if len(room_users_count) == 0:
        db.delete(f"{room_id}:users_ids")
        db.lrem("rooms", 1, room_id)


@socketio.on("joinRoom")
def join_room(room):
    join_socket_room(room)

    room_users_ids = [i.decode("utf-8") for i in db.lrange(f"{room}:users_ids", 0, -1)]
    db.rpush(f"{room}:users_ids", request.sid)

    if len(room_users_ids) >= 1:
        emit(
            "getCanvasImage",
            request.sid,
            broadcast=False,
            include_self=False,
            room=room_users_ids[0],
        )


@socketio.on("saveCanvasImage")
def save_canvas_img(data):
    emit(
        "newCanvasImageEvent",
        data.get("image"),
        broadcast=False,
        include_self=False,
        room=data.get("roomId"),
    )


@socketio.on("drawEvent")
def handle_new_drawing(data):
    emit(
        "drawEvent",
        {
            "coordinates": data["coordinates"],
            "color": data["color"],
            "weight": data["weight"],
        },
        broadcast=True,
        include_self=False,
        room=data["room"],
    )


@socketio.on("eraseEvent")
def handle_erase_event(data):
    emit(
        "eraseEvent",
        {
            "coordinates": data["coordinates"],
            "weight": data["weight"],
        },
        broadcast=True,
        include_self=False,
        room=data["room"],
    )


@socketio.on("clearEvent")
def clear_canvas(data):
    room_id = data.get("room")
    db.delete(f"{room_id}:image")

    emit("clearEvent", broadcast=True, include_self=False, room=room_id)


if __name__ == "__main__":
    socketio.run(app, debug=True)
