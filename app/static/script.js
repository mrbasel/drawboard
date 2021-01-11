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

    socket.on("connect", () => {
        console.log("You are connected.");

        let url = window.location.href.split("/")
        let roomName = url[url.length - 1];
        socket.emit("create", roomName);
        window.roomName = roomName;
    })

    socket.on("newDrawing", (coordinates) => {
        recordStrokes = false;
        const points = coordinates.slice();
        const firstPoint = points.shift();
        sketchpad.beginStroke(firstPoint.x, firstPoint.y);

        let prevPoint = firstPoint;
        while (points.length > 0) {
            const point = points.shift();

            const { x, y } = sketchpad.draw(point.x, point.y, prevPoint.x, prevPoint.y);

            prevPoint = { x, y };
        }
        sketchpad.endStroke(prevPoint.x, prevPoint.y);
    });

    sketchpad.addEventListener('strokerecorded', ({ stroke }) => {
        if (recordStrokes) {
            console.log(stroke);
            socket.emit("newDrawing", {
                coordinates: stroke.points,
                room: window.roomName
            });
        }
    }
    );
    canvas.addEventListener("mousedown", (event) => {
        recordStrokes = true;
        console.log("Mouse down");
    })
}