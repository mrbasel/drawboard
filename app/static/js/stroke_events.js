
const drawStroke = (strokeData, sketchpad, canvasData) => {
    const previousMode = sketchpad.mode;
    const previousColor = sketchpad.color;
    const previousStrokeWeight = sketchpad.weight;

    canvasData.recordStrokes = false;
    sketchpad.color = strokeData.color;
    sketchpad.mode = "draw";
    sketchpad.weight = strokeData.weight;

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
    sketchpad.weight = previousStrokeWeight;

}

const eraseStroke = (strokeData, sketchpad, canvasData) => {
    const previousMode = sketchpad.mode;
    const previousFontWeight = sketchpad.weight;

    canvasData.recordStrokes = false;
    sketchpad.mode = "erase";
    sketchpad.weight = strokeData.weight;

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
    sketchpad.weight = previousFontWeight;
}

export { drawStroke, eraseStroke };