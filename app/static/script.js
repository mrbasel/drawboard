window.onload = () => {
    let socket = io();

    socket.on("connect", () => {
        console.log("You are connected.");

        let url = window.location.href.split("/")
        let roomName = url[url.length - 1];
        socket.emit("create", roomName);
        window.roomName = roomName;
    })

    socket.on("newDrawing", (coordinates) => {
        ctx.beginPath();
        for (let index = 0; index < coordinates.length; index++) {
            ctx.lineTo(coordinates[index].xCord, coordinates[index].yCord);
            ctx.stroke();
        }
    })

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let isMouseDown = false;
    let drawingCoordinates = [];

    // Set canvas to fullscreen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.lineWidth = 10;

    canvas.addEventListener("mousedown", (x) => {
        ctx.beginPath();
        ctx.lineTo(x.clientX, x.clientY);
        isMouseDown = true;
    })

    canvas.addEventListener("mousemove", (x) => {
        if (isMouseDown) {
            ctx.lineTo(x.clientX, x.clientY);
            ctx.stroke();

            drawingCoordinates.push({
                xCord: x.clientX,
                yCord: x.clientY
            });
        }
    })

    canvas.addEventListener("mouseup", (x) => {
        isMouseDown = false;
        ctx.lineTo(x.clientX, x.clientY);
        ctx.stroke();

        socket.emit("newDrawing", {
            coordinates: drawingCoordinates,
            room: window.roomName
        });
        drawingCoordinates = [];
    })
}