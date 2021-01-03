window.onload = () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let isMouseDown = false;

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
        }
    })

    canvas.addEventListener("mouseup", (x) => {
        isMouseDown = false;
        ctx.lineTo(x.clientX, x.clientY);
        ctx.stroke();
    })
}