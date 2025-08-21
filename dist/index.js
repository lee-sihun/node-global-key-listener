"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalKeyboardListener = exports.KeyboardUtils = void 0;
const os = __importStar(require("os"));
const WinKeyServer_1 = require("./ts/WinKeyServer");
__exportStar(require("./ts/_types/IGlobalKeyListener"), exports);
__exportStar(require("./ts/_types/IGlobalKeyEvent"), exports);
__exportStar(require("./ts/_types/IGlobalKey"), exports);
__exportStar(require("./ts/_types/IGlobalKeyDownMap"), exports);
__exportStar(require("./ts/_types/IWindowsConfig"), exports);
__exportStar(require("./ts/_types/IConfig"), exports);
var KeyboardUtils_1 = require("./ts/_utils/KeyboardUtils");
Object.defineProperty(exports, "KeyboardUtils", { enumerable: true, get: function () { return KeyboardUtils_1.KeyboardUtils; } });
/**
 * A cross-platform global keyboard listener. Ideal for setting up global keyboard shortcuts
 * and key-loggers (usually for automation).
 * This keyserver uses low-level hooks on Windows OS and Event Taps on Mac OS, which allows
 * event propagation to be halted to the rest of the operating system as well as allowing
 * any key to be used for shortcuts.
 */
class GlobalKeyboardListener {
    /**
     * Creates a new keyboard listener
     * @param config The optional configuration for the key listener
     */
    constructor(config = {}) {
        /** Whether the server is currently running */
        this.isRunning = false;
        this.stopTimeoutID = 0;
        /** The following listener is used to monitor which keys are being held down */
        this.baseListener = event => {
            if (event.name) {
                switch (event.state) {
                    case "DOWN":
                        this.isDown[event.name] = true;
                        break;
                    case "UP":
                        this.isDown[event.name] = false;
                        break;
                }
            }
            let stopPropagation = false;
            for (let onKey of this.listeners) {
                //Forward event
                try {
                    const res = onKey(event, this.isDown);
                    //Handle catch data
                    if (res instanceof Object) {
                        if (res.stopPropagation)
                            stopPropagation = true;
                        if (res.stopImmediatePropagation)
                            break;
                    }
                    else if (res) {
                        stopPropagation = true;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
            return stopPropagation;
        };
        this.listeners = [];
        this.isDown = {};
        this.config = config;
        // Windows 전용으로 간소화
        if (os.platform() !== "win32") {
            throw Error("This version only supports Windows OS");
        }
        this.keyServer = new WinKeyServer_1.WinKeyServer(this.baseListener, config.windows);
    }
    /**
     * Add a global keyboard listener to the global keyboard listener server.
     * @param listener The listener to add to the global keyboard listener
     * @throws An exception if the process could not be started
     */
    async addListener(listener) {
        this.listeners.push(listener);
        if (this.listeners.length == 1) {
            clearTimeout(this.stopTimeoutID);
            await this.start();
        }
    }
    /**
     * Remove a global keyboard listener from the global keyboard listener server.
     * @param listener The listener to remove from the global keyboard listener
     */
    removeListener(listener) {
        var _a;
        const index = this.listeners.indexOf(listener);
        if (index != -1) {
            this.listeners.splice(index, 1);
            if (this.listeners.length == 0) {
                if (this.config.disposeDelay == -1)
                    this.stop();
                else
                    this.stopTimeoutID = setTimeout(() => this.stop(), (_a = this.config.disposeDelay) !== null && _a !== void 0 ? _a : 100);
            }
        }
    }
    /** Removes all listeners and destroys the key server */
    kill() {
        this.listeners = [];
        this.stop();
    }
    /** Start the key server */
    start() {
        let promise = Promise.resolve();
        if (!this.isRunning)
            promise = this.keyServer.start();
        this.isRunning = true;
        return promise;
    }
    /** Stop the key server */
    stop() {
        if (this.isRunning)
            this.keyServer.stop();
        this.isRunning = false;
    }
}
exports.GlobalKeyboardListener = GlobalKeyboardListener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUF5QjtBQUN6QixvREFBK0M7QUFPL0MsaUVBQStDO0FBQy9DLDhEQUE0QztBQUM1Qyx5REFBdUM7QUFDdkMsZ0VBQThDO0FBQzlDLDZEQUEyQztBQUMzQyxzREFBb0M7QUFDcEMsMkRBQXdEO0FBQWhELDhHQUFBLGFBQWEsT0FBQTtBQUVyQjs7Ozs7O0dBTUc7QUFDSCxNQUFhLHNCQUFzQjtJQWEvQjs7O09BR0c7SUFDSCxZQUFtQixTQUFrQixFQUFFO1FBWHZDLDhDQUE4QztRQUNwQyxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBMEU1QiwrRUFBK0U7UUFDdkUsaUJBQVksR0FBMEIsS0FBSyxDQUFDLEVBQUU7WUFDbEQsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO2dCQUNaLFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRTtvQkFDakIsS0FBSyxNQUFNO3dCQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQzt3QkFDL0IsTUFBTTtvQkFDVixLQUFLLElBQUk7d0JBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO3dCQUNoQyxNQUFNO2lCQUNiO2FBQ0o7WUFFRCxJQUFJLGVBQWUsR0FBRyxLQUFLLENBQUM7WUFDNUIsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUM5QixlQUFlO2dCQUNmLElBQUk7b0JBQ0EsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBRXRDLG1CQUFtQjtvQkFDbkIsSUFBSSxHQUFHLFlBQVksTUFB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