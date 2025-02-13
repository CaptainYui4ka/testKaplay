import kaplay from "kaplay";

export const k = kaplay({
    width: 1280,
    height: 720,
    debug: true,
    debugKey: 'f2',
    global: false,
    touchToMouse: true,
    canvas: document.getElementById("game"),
})