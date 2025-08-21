const {GlobalKeyboardListener} = require("./dist/index.js");

console.log("Starting native addon test...");

const v = new GlobalKeyboardListener();

v.addListener(function (e, down) {
    console.log(`Key ${e.name} was ${down ? "pressed" : "released"}.`);
    console.log("Event details:", e);
});

console.log("Keyboard listener started. Press Ctrl+C to exit.");
console.log("Try pressing some keys to see if the native addon works correctly.");

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\nStopping keyboard listener...");
    v.kill();
    process.exit(0);
});
