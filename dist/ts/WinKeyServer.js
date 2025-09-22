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
const fs = __importStar(require("fs"));
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
            const addonPath = this.resolveAddonPath();
            this.nativeAddon = require(addonPath);
        }
        catch (error) {
            throw new Error(`네이티브 애드온 로드에 실패했습니다. 설치가 올바르게 수행되었는지 확인해주세요.\n오류: ${error}`);
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
    /** addon.node 경로를 탐색하여 반환 */
    resolveAddonPath() {
        // 환경변수로 경로 강제 지정 가능
        const envPath = process.env.NODE_GKL_ADDON_PATH;
        if (envPath && fs.existsSync(envPath)) {
            return envPath;
        }
        const rootDir = Path.resolve(__dirname, "..", "..");
        const packageName = "node-global-key-listener-extended";
        // Node.js ABI 버전 (Electron에서는 electron ABI)
        const nodeAbi = process.versions.modules || "unknown";
        const platform = process.platform;
        const arch = process.arch;
        const candidates = [
            // 1. 표준 node-gyp 빌드 경로 (개발/재빌드 후)
            Path.resolve(rootDir, "build", "Release", "addon.node"),
            Path.resolve(rootDir, "build", "Debug", "addon.node"),
            // 2. 사전 빌드된 바이너리 경로 (배포 시 포함)
            Path.resolve(rootDir, "bin", `${platform}-${arch}-${nodeAbi}`, "addon.node"),
            Path.resolve(rootDir, "bin", `${platform}-${arch}`, "addon.node"),
            // 3. Electron asar unpack 경로
            ...(process.resourcesPath ? [
                Path.resolve(process.resourcesPath, "app.asar.unpacked", "node_modules", packageName, "build", "Release", "addon.node"),
                Path.resolve(process.resourcesPath, "app.asar.unpacked", "node_modules", packageName, "bin", `${platform}-${arch}-${nodeAbi}`, "addon.node"),
            ] : []),
            // 4. 과거 dist 복사 위치 (하위 호환)
            Path.resolve(rootDir, "dist", "addon.node"),
            Path.resolve(__dirname, "..", "addon.node"),
            // 5. require.resolve를 통한 탐색 (node_modules 내부)
            ...((() => {
                try {
                    const pkgPath = require.resolve(`${packageName}/package.json`);
                    const pkgDir = Path.dirname(pkgPath);
                    return [
                        Path.resolve(pkgDir, "build", "Release", "addon.node"),
                        Path.resolve(pkgDir, "bin", `${platform}-${arch}-${nodeAbi}`, "addon.node"),
                        Path.resolve(pkgDir, "dist", "addon.node"),
                    ];
                }
                catch {
                    return [];
                }
            })()),
        ];
        // 중복 제거
        const uniqueCandidates = [...new Set(candidates)];
        for (const p of uniqueCandidates) {
            try {
                if (fs.existsSync(p)) {
                    return p;
                }
            }
            catch {
                // ignore fs errors
            }
        }
        const searched = uniqueCandidates.map(p => `  - ${p}`).join("\n");
        throw new Error(`네이티브 애드온 로드에 실패했습니다. 다음 경로들을 확인해주세요:\n` +
            `1. 최종 빌드 경로: ${Path.resolve(rootDir, "dist", "addon.node")}\n` +
            `2. 컴파일 경로: ${Path.resolve(rootDir, "build", "Release", "addon.node")}\n` +
            `오류: Cannot find module '${Path.resolve(rootDir, "dist", "addon.node")}'`);
    }
}
exports.WinKeyServer = WinKeyServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2luS2V5U2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3RzL1dpbktleVNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0EsbUVBQThEO0FBRTlELDJDQUE2QjtBQUM3Qix1Q0FBeUI7QUFRekIsMkRBQTJEO0FBQzNELE1BQWEsWUFBWTtJQU9yQjs7OztPQUlHO0lBQ0gsWUFBbUIsUUFBK0IsRUFBRSxTQUF5QixFQUFFO1FBVHZFLGNBQVMsR0FBWSxLQUFLLENBQUM7UUFVL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsY0FBYztRQUNkLElBQUk7WUFDQSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN6QztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FDWCxxREFBcUQsS0FBSyxFQUFFLENBQy9ELENBQUM7U0FDTDtJQUNMLENBQUM7SUFFRCxxREFBcUQ7SUFDOUMsS0FBSyxDQUFDLEtBQUs7UUFDZCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1NBQ3BEO1FBRUQsT0FBTyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN6QyxJQUFJO2dCQUNBLHdCQUF3QjtnQkFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFTLEVBQUUsRUFBRTtvQkFDakMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFD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