import os
import secrets

from flask import Flask, request, render_template, url_for, redirect
from redis import Redis
from flask_socketio import SocketIO, emit, join_room, leave_room
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
    rooms = [i.decode("utf-8") for i in db.lrange("rooms", 0, -1)]
    if room_id not in rooms:
        return redirect(url_for("home"))

    db.incr(f"{room_id}:users_count", amount=1)

    return render_template("draw_room.html")


@app.route("/room/form/create", methods=["POST"])
def create_room_form():
    if request.form:
        username = request.form.get("name")
        room_visibility = request.form.get("roomVisiblity")
        room_id = secrets.token_hex(8)

        rooms = [i.decode("utf-8") for i in db.lrange("rooms", 0, -1)]
        while room_id in rooms:
            room_id = secrets.token_hex(8)

        db.rpush("rooms", room_id)
        db.set(f"{room_id}:users_count", 0)

        return redirect(url_for("draw_room", room_id=room_id))
    else:
        return redirect(url_for("home"))


@socketio.on("connect")
def on_connect():
    print("Connected!")


@socketio.on("client_disconnecting")
def on_client_disconnect(data):
    print("Client disconnected")

    room_id = data.get("roomId")
    # Decrease room users count by 1
    db.decr(f"{room_id}:users_count", amount=1)
    # Remove user's sid from room's sids list
    db.lrem(f"{room_id}:users_sids", 1, request.sid)

    room_users_count = db.get(f"{room_id}:users_count").decode("utf-8")

    if int(room_users_count) == 0:
        print("Deleting room..")
        db.delete(f"{room_id}:users_count")
        db.delete(f"{room_id}:users_sids")
        db.lrem("rooms", 1, room_id)


@socketio.on("create")
def create_room(room):
    join_room(room)
    # Add user's sid to room's sids list
    db.rpush(f"{room}:users_sids", request.sid)
    print("Joined room " + room)


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
    emit("clearEvent", broadcast=True, include_self=False, room=data["room"])


if __name__ == "__main__":
    socketio.run(app, debug=True)
