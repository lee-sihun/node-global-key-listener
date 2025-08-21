import {IGlobalKeyServer} from "./_types/IGlobalKeyServer";
import {IGlobalKeyEvent} from "./_types/IGlobalKeyEvent";
import {IGlobalKeyListenerRaw} from "./_types/IGlobalKeyListenerRaw";
import {WinGlobalKeyLookup} from "./_data/WinGlobalKeyLookup";
import {IWindowsConfig} from "./_types/IWindowsConfig";
import * as Path from "path";

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
            this.nativeAddon = require(Path.join(
                __dirname,
                "../../build/Release/addon.node"
            ));
        } catch (error) {
            throw new Error(`Failed to load native addon: ${error}`);
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
}
