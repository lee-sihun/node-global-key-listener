"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinKeyServer = void 0;
const child_process_1 = require("child_process");
const WinGlobalKeyLookup_1 = require("./_data/WinGlobalKeyLookup");
const path_1 = __importDefault(require("path"));
const isSpawnEventSupported_1 = require("./isSpawnEventSupported");
const sPath = "../../bin/WinKeyServer.exe";
/** Use this class to listen to key events on Windows OS */
class WinKeyServer {
    /**
     * Creates a new key server for windows
     * @param listener The callback to report key events to
     * @param windowsConfig The optional windows configuration
     */
    constructor(listener, config = {}) {
        this.listener = listener;
        this.config = config;
    }
    /** Start the Key server and listen for keypresses */
    async start() {
        var _a, _b;
        const serverPath = this.config.serverPath || path_1.default.join(__dirname, sPath);
        this.proc = child_process_1.execFile(serverPath, { maxBuffer: Infinity });
        if (this.config.onInfo)
            (_a = this.proc.stderr) === null || _a === void 0 ? void 0 : _a.on("data", data => { var _a, _b; return (_b = (_a = this.config).onInfo) === null || _b === void 0 ? void 0 : _b.call(_a, data.toString()); });
        if (this.config.onError)
            this.proc.on("close", this.config.onError);
        (_b = this.proc.stdout) === null || _b === void 0 ? void 0 : _b.on("data", data => {
            var _a;
            const events = this._getEventData(data);
            for (let { event, eventId } of events) {
                const stopPropagation = !!this.listener(event);
                (_a = this.proc.stdin) === null || _a === void 0 ? void 0 : _a.write(`${stopPropagation ? "1" : "0"},${eventId}\n`);
            }
        });
        return new Promise((res, err) => {
            this.proc.on("error", err);
            if (isSpawnEventSupported_1.isSpawnEventSupported())
                this.proc.on("spawn", res);
            // A timed fallback if the spawn event is not supported
            else
                setTimeout(res, 200);
        });
    }
    /** Stop the Key server */
    stop() {
        var _a;
        (_a = this.proc.stdout) === null || _a === void 0 ? void 0 : _a.pause();
        this.proc.kill();
    }
    /**
     * Obtains a IGlobalKeyEvent from stdout buffer data
     * @param data Data from stdout
     * @returns The standardized key event data
     */
    _getEventData(data) {
        const sData = data.toString();
        const lines = sData.trim().split(/\n/);
        return lines.map(line => {
            const lineData = line.replace(/\s+/, "");
            const [_mouseKeyboard, downUp, sKeyCode, sScanCode, sLocationX, sLocationY, eventId, sIsExtended,] = lineData.split(",");
            const isDown = downUp === 'DOWN';
            const isMouse = _mouseKeyboard === 'MOUSE';
            const keyCode = Number.parseInt(sKeyCode, 10);
            const scanCode = Number.parseInt(sScanCode, 10);
            const locationX = Number.parseFloat(sLocationX);
            const locationY = Number.parseFloat(sLocationY);
            const isExtended = sIsExtended === '1';
            const key = WinGlobalKeyLookup_1.WinGlobalKeyLookup[keyCode];
            return {
                event: {
                    vKey: keyCode,
                    rawKey: key,
                    name: key === null || key === void 0 ? void 0 : key.standardName,
                    state: isDown ? "DOWN" : "UP",
                    scanCode: scanCode,
                    location: [locationX, locationY],
                    isExtended: isMouse ? undefined : isExtended,
                    _raw: sData,
                },
                eventId,
            };
        });
    }
}
exports.WinKeyServer = WinKeyServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2luS2V5U2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RzL1dpbktleVNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSxpREFBcUQ7QUFHckQsbUVBQThEO0FBQzlELGdEQUF3QjtBQUV4QixtRUFBOEQ7QUFDOUQsTUFBTSxLQUFLLEdBQUcsNEJBQTRCLENBQUM7QUFFM0MsMkRBQTJEO0FBQzNELE1BQWEsWUFBWTtJQU1yQjs7OztPQUlHO0lBQ0gsWUFBbUIsUUFBK0IsRUFBRSxTQUF5QixFQUFFO1FBQzNFLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxxREFBcUQ7SUFDOUMsS0FBSyxDQUFDLEtBQUs7O1FBQ2QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLElBQUksY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLElBQUksR0FBRyx3QkFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzFELElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQ2xCLE1BQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLDBDQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsZUFBQyxPQUFBLE1BQUEsTUFBQSxJQUFJLENBQUMsTUFBTSxFQUFDLE1BQU0sbURBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUEsRUFBQSxDQUFDLENBQUM7UUFDaEYsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87WUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMs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