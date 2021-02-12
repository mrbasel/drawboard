import {
    clearButton,
    colorPicker,
    selectModeButton,
    thicknessSlider,
    drawButton,
    eraseButton,
    colorPickerBtn,
    clearBtn,
    thinknessBtn
} from "./constants.js";
import { getRoomId, CanvasData } from "./helpers.js";
import { drawStroke, eraseStroke } from "./stroke_events.js";
import { handleToolbarClick } from "./toolbar.js";


window.onload = () => {
    let socket = io();
    const canvasData = new CanvasData(getRoomId(), true, "#000000");
    const canvas = document.querySelector('#canvas');
    const canvasContext = canvas.getContext("2d");
    const sketchpad = new Atrament(canvas, {
        width: window.screen.availWidth,
        height: window.screen.availHeight,
    });
    sketchpad.recordStrokes = true;

    window.onbeforeunload = () => {
        socket.emit('client_disconnecting', { roomId: canvasData.roomId });
        return "";
    }

    socket.on("connect", () => { socket.emit("joinRoom", canvasData.roomId); console.log(canvasData.roomId); });
    socket.on("disconnect", () => { socket.emit("disconnect") });

    socket.on("drawEvent", (strokeData) => drawStroke(strokeData, sketchpad, canvasData));

    socket.on("clearEvent", () => sketchpad.clear());

    socket.on("eraseEvent", (strokeData) => eraseStroke(strokeData, sketchpad, canvasData));

    socket.on("getCanvasImage", () => {
        let canvasImage = sketchpad.toImage();

        socket.emit("saveCanvasImage", {
            roomId: canvasData.roomId,
            image: canvasImage
        })
    });

    socket.on("newCanvasImageEvent", (canvasImage) => {
        let img = new Image();
        img.src = canvasImage;

        img.onload = () => {
            canvasContext.drawImage(img, 0, 0);
            console.log("Image drawn!");
        }
    });

    sketchpad.addEventListener('strokerecorded', ({ stroke }) => {
        if (canvasData.recordStrokes) {

            if (sketchpad.mode == "draw") {
                console.log(stroke);
                socket.emit("drawEvent", {
                    coordinates: stroke.points,
                    weight: stroke.weight,
                    color: sketchpad.color,
                    room: canvasData.roomId
                });
            }
            else if (sketchpad.mode == "erase") {
                socket.emit("eraseEvent", {
                    coordinates: stroke.points,
                    weight: stroke.weight,
                    room: canvasData.roomId
                });
            }
        }
    }
    );

    canvas.addEventListener("mousedown", () => canvasData.recordStrokes = true);

    drawButton.addEventListener("click", () => {
        sketchpad.mode = "draw";
        handleToolbarClick(drawButton);
    });

    thinknessBtn.addEventListener("click", () => {
        // Boolean indicating if pop is open or not
        const isOpen = document.querySelector('.popup').style.display == 'block';

        if (isOpen) {
            document.querySelector('.popup').style.display = 'none';
        }
        else {
            document.querySelector('.popup').style.display = 'block';
        }
    });

    eraseButton.addEventListener("click", () => {
        sketchpad.mode = "erase";
        handleToolbarClick(eraseButton);
    });

    colorPickerBtn.addEventListener("click", () => {
        // Show color picker menu
        colorPicker.click();
    })

    colorPicker.addEventListener("change", (event) => {
        canvasData.strokesColor = event.target.value;
        sketchpad.color = event.target.value;
    });

    clearBtn.addEventListener("click", () => {
        const confirmClear = confirm("Are you sure you want to clear the board?");

        if (confirmClear) {
            sketchpad.clear();
            socket.emit("clearEvent", {
                room: canvasData.roomId
            });
        }
    });

    clearButton.addEventListener("click", () => {
        sketchpad.clear();
        socket.emit("clearEvent", {
            room: canvasData.roomId
        });
    });
    selectModeButton.addEventListener("change", () => {
        sketchpad.mode = selectModeButton.value;
    });
    thicknessSlider.addEventListener("change", () => {
        sketchpad.weight = parseInt(thicknessSlider.value);
    });
}