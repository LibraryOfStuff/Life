window.stateHistory = [];

function logHistory() {
    stateHistory.push(
        generateSave(undefined, {keep:["temp","color"]})
    );
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