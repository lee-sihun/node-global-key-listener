import {IGlobalKeyServer} from "./_types/IGlobalKeyServer";
import {IGlobalKeyEvent} from "./_types/IGlobalKeyEvent";
import {IGlobalKeyListenerRaw} from "./_types/IGlobalKeyListenerRaw";
import {WinGlobalKeyLookup} from "./_data/WinGlobalKeyLookup";
import {IWindowsConfig} from "./_types/IWindowsConfig";
import * as Path from "path";
import * as fs from "fs";

// 네이티브 애드온 인터페이스 정의
interface NativeAddon {
    start(callback: (data: any) => void): void;
    stop(): void;
}

/** Use this class to listen to key events on Windows OS */
export class WinKeyServer implements IGlobalKeyServer {
    protected listener: IGlobalKeyListenerRaw;
    private nativeAddon: NativeAddon;
    private isStarted: boolean = false;

    protected config: IWindowsConfig;

    /**
     * Creates a new key server for windows
     * @param listener The callback to report key events to
     * @param windowsConfig The optional windows configuration
     */
    public constructor(listener: IGlobalKeyListenerRaw, config: IWindowsConfig = {}) {
        this.listener = listener;
        this.config = config;

        // 네이티브 애드온 로드
        try {
            const addonPath = this.resolveAddonPath();
            this.nativeAddon = require(addonPath);
        } catch (error) {
            throw new Error(
                `네이티브 애드온 로드에 실패했습니다. 설치가 올바르게 수행되었는지 확인해주세요.\n오류: ${error}`
            );
        }
    }

    /** Start the Key server and listen for keypresses */
    public async start() {
        if (this.isStarted) {
            throw new Error("Key server is already started");
        }

        return new Promise<void>((resolve, reject) => {
            try {
                // 네이티브 애드온의 start 함수 호출
                this.nativeAddon.start((data: any) => {
                    const event = this._convertToGlobalKeyEvent(data);
                    this.listener(event);
                });

                this.isStarted = true;
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /** Stop the Key server */
    public stop() {
        if (!this.isStarted) {
            return;
        }

        try {
            this.nativeAddon.stop();
            this.isStarted = false;
        } catch (error) {
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
    protected _convertToGlobalKeyEvent(data: any): IGlobalKeyEvent {
        const keyCode = data.vkCode;
        const scanCode = data.scanCode;
        const isDown = data.state === "DOWN";
        const isExtended = data.isExtended || false;

        const key = WinGlobalKeyLookup[keyCode];

        return {
            vKey: keyCode,
            rawKey: key,
            name: key?.standardName,
            state: isDown ? "DOWN" : "UP",
            scanCode: scanCode,
            location: [0, 0], // 네이티브 애드온에서는 마우스 위치 정보가 없으므로 기본값
            isExtended: isExtended,
            _raw: JSON.stringify(data),
        };
    }

    /** addon.node 경로를 탐색하여 반환 */
    private resolveAddonPath(): string {
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
            ...((process as any).resourcesPath
                ? [
                      Path.resolve(
                          (process as any).resourcesPath,
                          "app.asar.unpacked",
                          "node_modules",
                          packageName,
                          "build",
                          "Release",
                          "addon.node"
                      ),
                      Path.resolve(
                          (process as any).resourcesPath,
                          "app.asar.unpacked",
                          "node_modules",
                          packageName,
                          "bin",
                          `${platform}-${arch}-${nodeAbi}`,
                          "addon.node"
                      ),
                  ]
                : []),

            // 4. 과거 dist 복사 위치 (하위 호환)
            Path.resolve(rootDir, "dist", "addon.node"),
            Path.resolve(__dirname, "..", "addon.node"),

            // 5. require.resolve를 통한 탐색 (node_modules 내부)
            ...(() => {
                try {
                    const pkgPath = require.resolve(`${packageName}/package.json`);
                    const pkgDir = Path.dirname(pkgPath);
                    return [
                        Path.resolve(pkgDir, "build", "Release", "addon.node"),
                        Path.resolve(
                            pkgDir,
                            "bin",
                            `${platform}-${arch}-${nodeAbi}`,
                            "addon.node"
                        ),
                        Path.resolve(pkgDir, "dist", "addon.node"),
                    ];
                } catch {
                    return [];
                }
            })(),
        ];

        // 중복 제거
        const uniqueCandidates = [...new Set(candidates)];

        for (const p of uniqueCandidates) {
            try {
                if (fs.existsSync(p)) {
                    return p;
                }
            } catch {
                // ignore fs errors
            }
        }

        const searched = uniqueCandidates.map(p => `  - ${p}`).join("\n");
        throw new Error(
            `네이티브 애드온 로드에 실패했습니다. 다음 경로들을 확인해주세요:\n` +
                `1. 최종 빌드 경로: ${Path.resolve(rootDir, "dist", "addon.node")}\n` +
                `2. 컴파일 경로: ${Path.resolve(
                    rootDir,
                    "build",
                    "Release",
                    "addon.node"
                )}\n` +
                `오류: Cannot find module '${Path.resolve(
                    rootDir,
                    "dist",
                    "addon.node"
                )}'`
        );
    }
}
