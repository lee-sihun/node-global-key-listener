"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const KeyboardUtils_1 = require("./ts/utils/KeyboardUtils");
const v = new _1.GlobalKeyboardListener({
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
    const enhancedName = KeyboardUtils_1.KeyboardUtils.getEnhancedKeyName(e);
    const location = KeyboardUtils_1.KeyboardUtils.getKeyLocation(e);
    const debugInfo = KeyboardUtils_1.KeyboardUtils.getDebugInfo(e);
    // console.log(
    //     (e.name || 'UNKNOWN').padStart(15),
    //     e.state.padStart(4),
    //     e.isExtended ? '[MAIN]' : '[NUMPAD]',
    //     `VK:0x${e.vKey.toString(16)}`
    // );
    // // Insert 키 구분
    // if (e.state === "DOWN" && e.vKey === 0x2D) {
    //     console.log(e.isExtended ? "메인 Insert!" : "넘버패드 Insert!");
    // }
    // console.log(e.isExtended);
    console.log(`enhancedName: ${enhancedName}, location: ${location}, debugInfo: ${debugInfo}`);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsd0JBQXlDO0FBQ3pDLDREQUF5RDtBQUV6RCxNQUFNLENBQUMsR0FBRyxJQUFJLHlCQUFzQixDQUFDO0lBQ2pDLE9BQU8sRUFBRTtRQUNMLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMxRCxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7S0FDaEQ7SUFDRCxHQUFHLEVBQUU7UUFDRCxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDMUQsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0tBQ2hEO0NBQ0osQ0FBQyxDQUFDO0FBRUgsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJO0lBQzNCLE1BQU0sWUFBWSxHQUFHLDZCQUFhLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekQsTUFBTSxRQUFRLEdBQUcsNkJBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsTUFBTSxTQUFTLEdBQUcsNkJBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFaEQsZUFBZTtJQUNmLDBDQUEwQztJQUMxQywyQkFBMkI7SUFDM0IsNENBQTRDO0lBQzVDLG9DQUFvQztJQUNwQyxLQUFLO0lBRUwsaUJBQWlCO0lBQ2pCLCtDQUErQztJQUMvQyxpRUFBaUU7SUFDakUsSUFBSTtJQUVKLDZCQUE2QjtJQUU3QixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixZQUFZLGVBQWUsUUFBUSxnQkFBZ0IsU0FBUyxFQUFFLENBQUMsQ0FBQztBQUNqRyxDQUFDLENBQUMsQ0FBQyJ9