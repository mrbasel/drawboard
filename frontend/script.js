window.onload = () => {
    let socket = io.connect('http://127.0.0.1:5000');

    socket.on("connect", () => {
        console.log("You are connected.");
    })

    socket.on("newData", (cordinates) => {
        ctx.beginPath();
        for (let index = 0; index < cordinates.length; index++) {
            ctx.lineTo(cordinates[index].xCord, cordinates[index].yCord);
            ctx.stroke();
        }
    })

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let isMouseDown = false;
    let cords = [];

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

            cords.push({
                xCord: x.clientX,
                yCord: x.clientY
            });
        }
    })

    canvas.addEventListener("mouseup", (x) => {
        isMouseDown = false;
        ctx.lineTo(x.clientX, x.clientY);
        ctx.stroke();

        socket.emit("mouseEvent", cords);
        cords = [];
    })
}