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
        const rootDir = Path.resolve(__dirname, "..", "..");
        const candidates = [
            Path.resolve(rootDir, "build", "Release", "addon.node"),
            Path.resolve(rootDir, "build", "Debug", "addon.node"),
            // 과거 dist에 복사되던 위치(하위 호환)
            Path.resolve(__dirname, "..", "addon.node"),
        ];

        for (const p of candidates) {
            try {
                if (fs.existsSync(p)) return p;
            } catch {
                // ignore fs errors
            }
        }

        const searched = candidates.map(p => ` - ${p}`).join("\n");
        throw new Error(
            `네이티브 애드온(addon.node)을 찾을 수 없습니다. 다음 경로들을 확인해주세요:\n${searched}`
        );
    }
}
