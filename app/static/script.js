window.onload = () => {
    let socket = io();
    const canvas = document.querySelector('#canvas');
    const sketchpad = new Atrament(canvas, {
        width: window.innerWidth,
        height: window.innerHeight
    });
    sketchpad.recordStrokes = true;

    // Flag to disable stroke recording when using the beginStroke and endStroke methods
    let recordStrokes = false;
    let strokeColor = "#000000";

    socket.on("connect", () => {
        console.log("You are connected.");

        let url = window.location.href.split("/")
        let roomName = url[url.length - 1];
        socket.emit("create", roomName);
        window.roomName = roomName;
    })

    socket.on("newDrawing", (data) => {
        recordStrokes = false;
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
        sketchpad.color = strokeColor;
    });

    socket.on("clearCanvas", () => sketchpad.clear());

    sketchpad.addEventListener('strokerecorded', ({ stroke }) => {
        if (recordStrokes) {
            console.log(stroke);
            socket.emit("newDrawing", {
                coordinates: stroke.points,
                color: sketchpad.color,
                room: window.roomName
            });
        }
    }
    );
    canvas.addEventListener("mousedown", (event) => {
        recordStrokes = true;
        console.log("Mouse down");
    })


    const clearButton = document.querySelector("#clear-btn");
    const colorPicker = document.querySelector("#color-picker")
    const selectMode = document.querySelector("#select-mode");
    const thicknessSlider = document.querySelector("#thickness-slider");

    clearButton.addEventListener("click", () => {
        sketchpad.clear();
        socket.emit("clearCanvas", {
            room: window.roomName
        });
    });
    colorPicker.addEventListener("change", (event) => {
        strokeColor = event.target.value;
        sketchpad.color = event.target.value;
    });
    selectMode.addEventListener("change", () => {
        sketchpad.mode = selectMode.value;
    });
    thicknessSlider.addEventListener("change", () => {
        sketchpad.weight = parseInt(thicknessSlider.value);
    });
}