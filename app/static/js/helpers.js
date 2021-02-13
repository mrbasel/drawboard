class CanvasData {
    // Object for holding state
    constructor(roomId, recordStrokes, strokesColor) {
        this.roomId = roomId;
        this.recordStrokes = recordStrokes;
        this.strokesColor = strokesColor;
    }
}

const getRoomId = () => {
    const url = window.location.href.split("/");
    const roomId = url[url.length - 1];

    return roomId;
}

export { getRoomId, CanvasData };