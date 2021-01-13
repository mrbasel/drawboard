window.onload = () => {
    let socket = io();
    const canvasData = new CanvasData(getRoomName(), true, "#000000");


    const canvas = document.querySelector('#canvas');
    const sketchpad = new Atrament(canvas, {
        width: window.innerWidth,
        height: window.innerHeight,
    });
    sketchpad.recordStrokes = true;

    socket.on("connect", () => {
        console.log("You are connected.");

        socket.emit("create", canvasData.roomName);
    })

    socket.on("newDrawing", (data) => {
        canvasData.recordStrokes = false;
        sketchpad.color = data.color;

        const points = data.coordinates.slice();
        const firstPoint = points.shift();
        sketchpad.beginStroke(firstPoint.x, firstPoint.y);

        let prevPoint = firstPoint;
        while (points.length > 0) {
            const point = points.shift();

            const { x, y } = sketchpad.draw(point.x, point.y, prevPoint.x, prevPoint.y);

            prevPoint = { x, y };
        }
        sketchpad.endStroke(prevPoint.x, prevPoint.y);
        sketchpad.color = toString(canvasData.strokeColor);
    });

    socket.on("clearCanvas", () => sketchpad.clear());

    socket.on("eraseEvent", (data) => {
        console.log("Erase event");
        const previousMode = sketchpad.mode;

        canvasData.recordStrokes = false;
        sketchpad.mode = "erase";

        const points = data.coordinates.slice();
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
    })

    sketchpad.addEventListener('strokerecorded', ({ stroke }) => {
        if (canvasData.recordStrokes) {

            if (sketchpad.mode == "draw") {
                console.log(stroke);
                socket.emit("newDrawing", {
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
    canvas.addEventListener("mousedown", (event) => {
        canvasData.recordStrokes = true;
        console.log("Mouse down");
    })


    const clearButton = document.querySelector("#clear-btn");
    const colorPicker = document.querySelector("#color-picker")
    const selectMode = document.querySelector("#select-mode");
    const thicknessSlider = document.querySelector("#thickness-slider");

    clearButton.addEventListener("click", () => {
        sketchpad.clear();
        socket.emit("clearCanvas", {
            room: canvasData.roomName
        });
    });
    colorPicker.addEventListener("change", (event) => {
        canvasData.strokeColor = event.target.value;
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