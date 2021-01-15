
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

export { drawStroke, eraseStroke };