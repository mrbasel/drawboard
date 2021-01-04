from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = "SECRET!!:)"
socketio = SocketIO(app)
socketio.init_app(app, cors_allowed_origins="*")

@app.route("/")
def home():
    return "Hello Flask"

@socketio.on("mouseEvent")
def handle_mouse(cordinates):
    emit("newData", cordinates, broadcast=True)

if __name__ == "__main__":
    socketio.run(app)