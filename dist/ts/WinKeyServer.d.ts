import { IGlobalKeyServer } from "./_types/IGlobalKeyServer";
import { IGlobalKeyEvent } from "./_types/IGlobalKeyEvent";
import { IGlobalKeyListenerRaw } from "./_types/IGlobalKeyListenerRaw";
import { IWindowsConfig } from "./_types/IWindowsConfig";
/** Use this class to listen to key events on Windows OS */
export declare class WinKeyServer implements IGlobalKeyServer {
    protected listener: IGlobalKeyListenerRaw;
    private nativeAddon;
    private isStarted;
    protected config: IWindowsConfig;
    /**
     * Creates a new key server for windows
     * @param listener The callback to report key events to
     * @param windowsConfig The optional windows configuration
     */
    constructor(listener: IGlobalKeyListenerRaw, config?: IWindowsConfig);
    /** Start the Key server and listen for keypresses */
    start(): Promise<void>;
    /** Stop the Key server */
    stop(): void;
    /**
     * 네이티브 애드온에서 받은 데이터를 IGlobalKeyEvent로 변환
     * @param data 네이티브 애드온에서 받은 키 이벤트 데이터
     * @returns 표준화된 키 이벤트 데이터
     */
    protected _convertToGlobalKeyEvent(data: any): IGlobalKeyEvent;
}
//# sourceMappingURL=WinKeyServer.d.ts.map