import {
    clearButton,
    colorPicker,
    selectModeButton,
    thicknessSlider,
} from "./constants.js";
import { getRoomId, CanvasData } from "./helpers.js";
import { drawStroke, eraseStroke } from "./stroke_events.js";


window.onload = () => {
    let socket = io();
    const canvasData = new CanvasData(getRoomId(), true, "#000000");
    const canvas = document.querySelector('#canvas');
    const sketchpad = new Atrament(canvas, {
        width: window.innerWidth,
        height: window.innerHeight,
    });
    sketchpad.recordStrokes = true;

    socket.on("connect", () => { socket.emit("create", canvasData.roomId); console.log(canvasData.roomId); });

    socket.on("drawEvent", (strokeData) => drawStroke(strokeData, sketchpad, canvasData));

    socket.on("clearEvent", () => sketchpad.clear());

    socket.on("eraseEvent", (strokeData) => eraseStroke(strokeData, sketchpad, canvasData));

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

    clearButton.addEventListener("click", () => {
        sketchpad.clear();
        socket.emit("clearEvent", {
            room: canvasData.roomId
        });
    });
    colorPicker.addEventListener("change", (event) => {
        canvasData.strokesColor = event.target.value;
        sketchpad.color = event.target.value;
    });
    selectModeButton.addEventListener("change", () => {
        sketchpad.mode = selectModeButton.value;
    });
    thicknessSlider.addEventListener("change", () => {
        sketchpad.weight = parseInt(thicknessSlider.value);
    });
}