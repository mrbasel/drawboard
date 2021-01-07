import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/home")
def home():
    return render_template("home.html")


@socketio.on("newDrawing")
def handle_new_drawing(cordinates):
    emit("newDrawing", cordinates, broadcast=True)


if __name__ == "__main__":
    socketio.run(app)