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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiS2V5Ym9hcmRVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy91dGlscy9LZXlib2FyZFV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFhLGFBQWE7SUFFdEI7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFzQjtRQUN4QyxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO1lBQ2hDLE9BQU8sU0FBUyxDQUFDLENBQUMsc0JBQXNCO1NBQzNDO1FBRUQsa0NBQWtDO1FBQ2xDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLENBQUM7WUFDN0IsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO1lBQ2hCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztZQUNoQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7WUFDZCxDQUFDLElBQUksRUFBRSxLQUFLLENBQUM7WUFDYixDQUFDLElBQUksRUFBRSxTQUFTLENBQUM7WUFDakIsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDO1lBQ25CLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztZQUNkLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztZQUNaLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztZQUNmLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztZQUNkLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFPLG9CQUFvQjtTQUM3QyxDQUFDLENBQUM7UUFFSCxJQUFJLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbEMsdUJBQXVCO1lBQ3ZCLGlDQUFpQztZQUNqQyxnQ0FBZ0M7WUFDaEMsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUMvQztRQUVELFFBQVE7UUFD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