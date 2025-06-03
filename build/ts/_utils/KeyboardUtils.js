"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardUtils = void 0;
/**
 * 키보드 이벤트에서 정확한 키 위치를 구분하는 유틸리티 함수들
 *
 * Windows의 확장 키 플래그를 활용하여 메인 키보드와 넘버패드의 동일한 키를 구분합니다.
 *
 * 확장 키 플래그 (Extended Key Flag) 규칙:
 * - 메인 키보드의 특수 키들 (Insert, Delete, Home, End, Page Up/Down, 화살표): Extended = true
 * - 넘버패드의 동일한 키들: Extended = false
 * - 메인 키보드 숫자 (1-0): VK 코드 0x30-0x39
 * - 넘버패드 숫자 (1-0): VK 코드 0x60-0x69
 */
class KeyboardUtils {
    /**
     * 메인 키보드와 넘버패드의 동일한 키를 구분
     * @param event 키보드 이벤트
     * @returns 키의 정확한 위치 정보
     *
     * @example
     * // Insert 키 구분
     * const location = KeyboardUtils.getKeyLocation(event);
     * if (event.vKey === 0x2D) { // VK_INSERT
     *   if (location === 'main') console.log('메인 키보드 Insert');
     *   if (location === 'numpad') console.log('넘버패드 Insert');
     * }
     */
    static getKeyLocation(event) {
        if (event.isExtended === undefined) {
            return 'unknown'; // 마우스 이벤트 또는 확장 정보 없음
        }
        // 메인 키보드와 넘버패드에 공통으로 있는 키들의 VK 코드
        const dualLocationKeys = new Map([
            [0x2D, 'INSERT'],
            [0x2E, 'DELETE'],
            [0x24, 'HOME'],
            [0x23, 'END'],
            [0x21, 'PAGE_UP'],
            [0x22, 'PAGE_DOWN'],
            [0x25, 'LEFT'],
            [0x26, 'UP'],
            [0x27, 'RIGHT'],
            [0x28, 'DOWN'],
            [0x0D, 'ENTER'], // VK_RETURN (Enter)
        ]);
        if (dualLocationKeys.has(event.vKey)) {
            // Windows 확장 키 플래그 규칙:
            // - 메인 키보드 특수 키: Extended = true
            // - 넘버패드 동일 키: Extended = false
            return event.isExtended ? 'main' : 'numpad';
        }
        // 숫자 키들
        if (event.vKey >= 0x30 && event.vKey <= 0x39) {
            return 'main'; // 메인 키보드 숫자 (1-0)
        }
        if (event.vKey >= 0x60 && event.vKey <= 0x69) {
            return 'numpad'; // 넘버패드 숫자 (1-0)
        }
        // 넘버패드 전용 키들
        const numpadOnlyKeys = [
            0x6A,
            0x6B,
            0x6C,
            0x6D,
            0x6E,
            0x6F, // VK_DIVIDE (/)
        ];
        if (numpadOnlyKeys.includes(event.vKey)) {
            return 'numpad';
        }
        return 'main'; // 기본적으로 메인 키보드로 간주
    }
    /**
     * 향상된 키 이름 반환 (위치 정보 포함)
     * @param event 키보드 이벤트
     * @returns 위치 정보가 포함된 키 이름
     *
     * @example
     * // "INSERT" -> "NUMPAD INSERT" 또는 "MAIN INSERT"
     * const enhancedName = KeyboardUtils.getEnhancedKeyName(event);
     * console.log(enhancedName); // "NUMPAD INSERT" 또는 "INSERT"
     */
    static getEnhancedKeyName(event) {
        var _a;
        const location = this.getKeyLocation(event);
        const baseName = event.name || ((_a = event.rawKey) === null || _a === void 0 ? void 0 : _a.name) || 'UNKNOWN';
        if (location === 'numpad') {
            // 이미 "NUMPAD"로 시작하지 않는 경우에만 추가
            if (!baseName.startsWith('NUMPAD')) {
                return `NUMPAD ${baseName}`;
            }
        }
        else if (location === 'main') {
            // 메인 키보드의 특수 키들은 명시적으로 표시 (선택사항)
            const specialMainKeys = ['INSERT', 'DELETE', 'HOME', 'END', 'PAGE UP', 'PAGE DOWN'];
            if (specialMainKeys.includes(baseName)) {
                return `MAIN ${baseName}`;
            }
        }
        return baseName;
    }
    /**
     * 키 이벤트가 특정 위치의 특정 키인지 확인하는 헬퍼 함수
     * @param event 키보드 이벤트
     * @param keyName 확인할 키 이름
     * @param location 확인할 위치 ('main' | 'numpad' | 'any')
     * @returns 조건과 일치하는지 여부
     *
     * @example
     * // 넘버패드 Enter만 감지
     * if (KeyboardUtils.isKeyAtLocation(event, 'ENTER', 'numpad')) {
     *   console.log('넘버패드 Enter 키 감지!');
     * }
     *
     * // 메인 키보드 Insert만 감지
     * if (KeyboardUtils.isKeyAtLocation(event, 'INSERT', 'main')) {
     *   console.log('메인 키보드 Insert 키 감지!');
     * }
     */
    static isKeyAtLocation(event, keyName, location = 'any') {
        var _a;
        const eventKeyName = event.name || ((_a = event.rawKey) === null || _a === void 0 ? void 0 : _a.name);
        if (!eventKeyName || eventKeyName !== keyName) {
            return false;
        }
        if (location === 'any') {
            return true;
        }
        return this.getKeyLocation(event) === location;
    }
    /**
     * 디버깅용: 키 이벤트의 상세 정보를 문자열로 반환
     * @param event 키보드 이벤트
     * @returns 디버깅 정보 문자열
     */
    static getDebugInfo(event) {
        const location = this.getKeyLocation(event);
        const enhancedName = this.getEnhancedKeyName(event);
        return [
            `Key: ${enhancedName}`,
            `VK: 0x${event.vKey.toString(16).toUpperCase()}`,
            `Scan: ${event.scanCode}`,
            `Location: ${location}`,
            `Extended: ${event.isExtended}`,
            `State: ${event.state}`,
        ].join(' | ');
    }
}
exports.KeyboardUtils = KeyboardUtils;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiS2V5Ym9hcmRVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9fdXRpbHMvS2V5Ym9hcmRVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQTs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBYSxhQUFhO0lBRXRCOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBc0I7UUFDeEMsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRTtZQUNoQyxPQUFPLFNBQVMsQ0FBQyxDQUFDLHNCQUFzQjtTQUMzQztRQUVELGtDQUFrQztRQUNsQyxNQUFNLGdCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDO1lBQzdCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztZQUNoQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUM7WUFDaEIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDO1lBQ2QsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO1lBQ2IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDO1lBQ2pCLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQztZQUNuQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7WUFDZCxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7WUFDWixDQUFDLElBQUksRUFBRSxPQUFPLENBQUM7WUFDZixDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7WUFDZCxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFBTyxvQkFBb0I7U0FDN0MsQ0FBQyxDQUFDO1FBRUgsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2xDLHVCQUF1QjtZQUN2QixpQ0FBaUM7WUFDakMsZ0NBQWdDO1lBQ2hDLE9BQU8sS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDL0M7UUFFRCxRQUFRO1FB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