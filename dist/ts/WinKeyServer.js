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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinKeyServer = void 0;
const WinGlobalKeyLookup_1 = require("./_data/WinGlobalKeyLookup");
const Path = __importStar(require("path"));
/** Use this class to listen to key events on Windows OS */
class WinKeyServer {
    /**
     * Creates a new key server for windows
     * @param listener The callback to report key events to
     * @param windowsConfig The optional windows configuration
     */
    constructor(listener, config = {}) {
        this.isStarted = false;
        this.listener = listener;
        this.config = config;
        // 네이티브 애드온 로드
        try {
            // 빌드 후 'addon.node' 파일은 'dist' 폴더에 복사됩니다.
            // 이 파일(WinKeyServer.js)은 'dist/ts/'에 위치하므로,
            // addon.node에 접근하기 위한 상대 경로는 '../addon.node'가 됩니다.
            const addonPath = Path.join(__dirname, "..", "addon.node");
            this.nativeAddon = require(addonPath);
        }
        catch (error) {
            const buildPath = Path.resolve(__dirname, "..", "..", "build", "Release", "addon.node");
            const distPath = Path.resolve(__dirname, "..", "addon.node");
            throw new Error(`네이티브 애드온 로드에 실패했습니다. 다음 경로들을 확인해주세요:\n1. 최종 빌드 경로: ${distPath}\n2. 컴파일 경로: ${buildPath}\n오류: ${error}`);
        }
    }
    /** Start the Key server and listen for keypresses */
    async start() {
        if (this.isStarted) {
            throw new Error("Key server is already started");
        }
        return new Promise((resolve, reject) => {
            try {
                // 네이티브 애드온의 start 함수 호출
                this.nativeAddon.start((data) => {
                    const event = this._convertToGlobalKeyEvent(data);
                    this.listener(event);
                });
                this.isStarted = true;
                resolve();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /** Stop the Key server */
    stop() {
        if (!this.isStarted) {
            return;
        }
        try {
            this.nativeAddon.stop();
            this.isStarted = false;
        }
        catch (error) {
            if (this.config.onError) {
                this.config.onError(error);
            }
        }
    }
    /**
     * 네이티브 애드온에서 받은 데이터를 IGlobalKeyEvent로 변환
     * @param data 네이티브 애드온에서 받은 키 이벤트 데이터
     * @returns 표준화된 키 이벤트 데이터
     */
    _convertToGlobalKeyEvent(data) {
        const keyCode = data.vkCode;
        const scanCode = data.scanCode;
        const isDown = data.state === "DOWN";
        const isExtended = data.isExtended || false;
        const key = WinGlobalKeyLookup_1.WinGlobalKeyLookup[keyCode];
        return {
            vKey: keyCode,
            rawKey: key,
            name: key === null || key === void 0 ? void 0 : key.standardName,
            state: isDown ? "DOWN" : "UP",
            scanCode: scanCode,
            location: [0, 0],
            isExtended: isExtended,
            _raw: JSON.stringify(data),
        };
    }
}
exports.WinKeyServer = WinKeyServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2luS2V5U2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RzL1dpbktleVNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsbUVBQThEO0FBRTlELDJDQUE2QjtBQVE3QiwyREFBMkQ7QUFDM0QsTUFBYSxZQUFZO0lBT3JCOzs7O09BSUc7SUFDSCxZQUFtQixRQUErQixFQUFFLFNBQXlCLEVBQUU7UUFUdkUsY0FBUyxHQUFZLEtBQUssQ0FBQztRQVUvQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUVyQixjQUFjO1FBQ2QsSUFBSTtZQUNBLDBDQUEwQztZQUMxQyw0Q0FBNEM7WUFDNUMsbURBQW1EO1lBQ25ELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMzRCxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN6QztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FDMUIsU0FBUyxFQUNULElBQUksRUFDSixJQUFJLEVBQ0osT0FBTyxFQUNQLFNBQVMsRUFDVCxZQUFZLENBQ2YsQ0FBQztZQUNGLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztZQUM3RCxNQUFNLElBQUksS0FBSyxDQUNYLHNEQUFzRCxRQUFRLGdCQUFnQixTQUFTLFNBQVMsS0FBSyxFQUFFLENBQzFHLENBQUM7U0FDTDtJQUNMLENBQUM7SUFFRCxxREFBcUQ7SUFDOUMsS0FBSyxDQUFDLEtBQUs7UUFDZCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1NBQ3BEO1FBRUQsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN6QyxJQUFJO2dCQUNBLHdCQUF3QjtnQkFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFTLEVBQUUsRUFBRTtvQkFDakMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN6QixDQUFDLENBQUMsQ0FBQztnQkFFSCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDdEIsT0FBTyxFQUFFLENBQUM7YUFDYjtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNaLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqQjtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELDBCQUEwQjtJQUNuQixJQUFJO1FBQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDakIsT0FBTztTQUNWO1FBRUQsSUFBSTtZQUNBLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7U0FDMUI7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNaLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzlCO1NBQ0o7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNPLHdCQUF3QixDQUFDLElBQVM7UUFDeEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEtBQUssTUFBTSxDQUFDO1FBQ3JDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO1FBRTVDLE1BQU0sR0FBRyxHQUFHLHVDQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXhDLE9BQU87WUFDSCxJQUFJLEVBQUUsT0FBTztZQUNiLE1BQU0sRUFBRSxHQUFHO1lBQ1gsSUFBSSxFQUFFLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxZQUFZO1lBQ3ZCLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUM3QixRQUFRLEVBQUUsUUFBUTtZQUNsQixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztTQUM3QixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBckdELG9DQXFHQyJ9