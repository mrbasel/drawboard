window.onload = () => {
    let socket = io();
    const canvasData = new CanvasData(getRoomName(), true, "#000000");
    const canvas = document.querySelector('#canvas');
    const sketchpad = new Atrament(canvas, {
        width: window.innerWidth,
        height: window.innerHeight,
    });
    sketchpad.recordStrokes = true;

    socket.on("connect", () => socket.emit("create", canvasData.roomName));

    socket.on("drawEvent", (strokeData) => drawStroke(strokeData, sketchpad, canvasData));

    socket.on("clearEvent", () => sketchpad.clear());

    socket.on("eraseEvent", (strokeData) => eraseStroke(strokeData, sketchpad, canvasData));

    sketchpad.addEventListener('strokerecorded', ({ stroke }) => {
        if (canvasData.recordStrokes) {

            if (sketchpad.mode == "draw") {
                console.log(stroke);
                socket.emit("drawEvent", {
                    coordinates: stroke.points,
                    color: sketchpad.color,
                    room: canvasData.roomName
                });
            }
            else if (sketchpad.mode == "erase") {
                socket.emit("eraseEvent", {
                    coordinates: stroke.points,
                    room: canvasData.roomName
                });
            }
        }
    }
    );

    canvas.addEventListener("mousedown", (event) => canvasData.recordStrokes = true);

    const clearButton = document.querySelector("#clear-btn");
    const colorPicker = document.querySelector("#color-picker")
    const selectMode = document.querySelector("#select-mode");
    const thicknessSlider = document.querySelector("#thickness-slider");

    clearButton.addEventListener("click", () => {
        sketchpad.clear();
        socket.emit("clearEvent", {
            room: canvasData.roomName
        });
    });
    colorPicker.addEventListener("change", (event) => {
        canvasData.strokesColor = event.target.value;
        sketchpad.color = event.target.value;
    });
    selectMode.addEventListener("change", () => {
        sketchpad.mode = selectMode.value;
    });
    thicknessSlider.addEventListener("change", () => {
        sketchpad.weight = parseInt(thicknessSlider.value);
    });
}


class CanvasData {
    // Object for holding state
    constructor(roomName, recordStrokes, strokesColor) {
        this.roomName = roomName;
        this.recordStrokes = recordStrokes;
        this.strokesColor = strokesColor;
    }
}

const getRoomName = () => {
    const url = window.location.href.split("/");
    const roomName = url[url.length - 1];

    return roomName;
}

const drawStroke = (strokeData, sketchpad, canvasData) => {
    const previousMode = sketchpad.mode;
    const previousColor = sketchpad.color;

    canvasData.recordStrokes = false;
    sketchpad.color = strokeData.color;
    sketchpad.mode = "draw";

    const points = strokeData.coordinates.slice();
    const firstPoint = points.shift();
    sketchpad.beginStroke(firstPoint.x, firstPoint.y);

    let prevPoint = firstPoint;
    while (points.length > 0) {
        const point = points.shift();

        const { x, y } = sketchpad.draw(point.x, point.y, prevPoint.x, prevPoint.y);

        prevPoint = { x, y };
    }
    sketchpad.endStroke(prevPoint.x, prevPoint.y);
    sketchpad.color = previousColor;
    sketchpad.mode = previousMode;

}

const eraseStroke = (strokeData, sketchpad, canvasData) => {
    const previousMode = sketchpad.mode;

    canvasData.recordStrokes = false;
    sketchpad.mode = "erase";

    const points = strokeData.coordinates.slice();
    const firstPoint = points.shift();
    sketchpad.beginStroke(firstPoint.x, firstPoint.y);

    let prevPoint = firstPoint;
    while (points.length > 0) {
        const point = points.shift();

        const { x, y } = sketchpad.draw(point.x, point.y, prevPoint.x, prevPoint.y);

        prevPoint = { x, y };
    }
    sketchpad.endStroke(prevPoint.x, prevPoint.y);

    // Set mode back to user's previous mode before erase event
    sketchpad.mode = previousMode;
}