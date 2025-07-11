"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalKeyboardListener = exports.KeyboardUtils = void 0;
const os_1 = __importDefault(require("os"));
const MacKeyServer_1 = require("./ts/MacKeyServer");
const WinKeyServer_1 = require("./ts/WinKeyServer");
const X11KeyServer_1 = require("./ts/X11KeyServer");
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
        switch (os_1.default.platform()) {
            case "win32":
                this.keyServer = new WinKeyServer_1.WinKeyServer(this.baseListener, config.windows);
                break;
            case "darwin":
                this.keyServer = new MacKeyServer_1.MacKeyServer(this.baseListener, config.mac);
                break;
            case "linux":
                this.keyServer = new X11KeyServer_1.X11KeyServer(this.baseListener, config.x11);
                break;
            default:
                throw Error("This OS is not supported");
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRDQUFvQjtBQUNwQixvREFBK0M7QUFDL0Msb0RBQStDO0FBQy9DLG9EQUErQztBQU8vQyxpRUFBK0M7QUFDL0MsOERBQTRDO0FBQzVDLHlEQUF1QztBQUN2QyxnRUFBOEM7QUFDOUMsNkRBQTJDO0FBQzNDLHNEQUFvQztBQUNwQywyREFBMEQ7QUFBakQsOEdBQUEsYUFBYSxPQUFBO0FBRXRCOzs7Ozs7R0FNRztBQUNILE1BQWEsc0JBQXNCO0lBYS9COzs7T0FHRztJQUNILFlBQW1CLFNBQWtCLEVBQUU7UUFYdkMsOENBQThDO1FBQ3BDLGNBQVMsR0FBRyxLQUFLLENBQUM7UUFDbEIsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFnRjVCLCtFQUErRTtRQUN2RSxpQkFBWSxHQUEwQixLQUFLLENBQUMsRUFBRTtZQUNsRCxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFO29CQUNqQixLQUFLLE1BQU07d0JBQ1AsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO3dCQUMvQixNQUFNO29CQUNWLEtBQUssSUFBSTt3QkFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7d0JBQ2hDLE1BQU07aUJBQ2I7YUFDSjtZQUVELElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztZQUM1QixLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQzlCLGVBQWU7Z0JBQ2YsSUFBSTtvQkFDQSxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFFdEMsbUJBQW1CO29CQUNuQixJ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