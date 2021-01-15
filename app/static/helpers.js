class CanvasData {
    // Object for holding state
    constructor(roomName, recordStrokes, strokesColor) {
        this.roomName = roomName;
        this.recordStrokes = recordStrokes;
        this.strokesColor = strokesColor;
    }
}

const getRoomName = () => {
    const url = window.location.href.split("/");
    const roomName = url[url.length - 1];

    return roomName;
}

export { getRoomName, CanvasData };