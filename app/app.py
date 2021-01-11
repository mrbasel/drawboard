import os

from flask import Flask, request, render_template, url_for, redirect
from flask_socketio import SocketIO, emit, join_room, leave_room
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")


@app.route("/home")
def home():
    return render_template("home.html")


@app.route("/room/<name>")
def draw_room(name):
    return render_template("draw_room.html")


@app.route("/room/form/create", methods=["POST"])
def create_room_form():
    if request.form:
        room_name = request.form.get("name")
        room_visibility = request.form.get("roomVisiblity")

        return redirect(url_for("draw_room", name=room_name))
    else:
        return redirect(url_for("home"))


@socketio.on("connect")
def on_connect():
    print("Connected!")


@socketio.on("create")
def create_room(room):
    join_room(room)
    print("Joined room " + room)


@socketio.on("newDrawing")
def handle_new_drawing(data):
    emit(
        "newDrawing",
        data["coordinates"],
        broadcast=True,
        include_self=False,
        room=data["room"],
    )


@socketio.on("clearCanvas")
def clear_canvas(data):
    emit("clearCanvas", broadcast=True, include_self=False, room=data["room"])


if __name__ == "__main__":
    socketio.run(app, debug=True)
