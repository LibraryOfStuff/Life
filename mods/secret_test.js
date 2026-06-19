window.stateHistory = [];

function logHistory() {
    if (window.structuredClone === undefined) return;

    stateHistory.push(structuredClone([currentPixels, currentRelations]));
    if (stateHistory.length > 10) stateHistory.shift();
}

window.addEventListener("load", () => {
    gameCanvas.addEventListener("mouseup", () => {
        logHistory();
        console.log(".");
    })
    gameCanvas.addEventListener("touchend", () => {
        logHistory();
        console.log(".");
    })
})