import {GlobalKeyboardListener} from ".";
import { KeyboardUtils } from "./ts/_utils/KeyboardUtils";

const v = new GlobalKeyboardListener({
    windows: {
        onError: errorCode => console.error("ERROR: " + errorCode),
        onInfo: info => console.info("INFO: " + info),
    },
    mac: {
        onError: errorCode => console.error("ERROR: " + errorCode),
        onInfo: info => console.info("INFO: " + info),
    },
});

v.addListener(function (e, down) {
    const enhancedName = KeyboardUtils.getEnhancedKeyName(e);
    const location = KeyboardUtils.getKeyLocation(e);
    const debugInfo = KeyboardUtils.getDebugInfo(e);

    console.log(
        (e.name || 'UNKNOWN').padStart(15),
        e.state.padStart(4),
        e.isExtended ? '[MAIN]' : '[NUMPAD]',
        `VK:0x${e.vKey.toString(16)}`
    );
    
    // Insert 키 구분
    if (e.state === "DOWN" && e.vKey === 0x2D) {
        console.log(e.isExtended ? "메인 Insert!" : "넘버패드 Insert!");
    }

    console.log(e.isExtended);

    console.log(`enhancedName: ${enhancedName}, location: ${location}, debugInfo: ${debugInfo}`);
});
