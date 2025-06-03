import {IGlobalKeyEvent} from "../_types/IGlobalKeyEvent";

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
export class KeyboardUtils {
    
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
    static getKeyLocation(event: IGlobalKeyEvent): 'main' | 'numpad' | 'unknown' {
        if (event.isExtended === undefined) {
            return 'unknown'; // 마우스 이벤트 또는 확장 정보 없음
        }

        // 메인 키보드와 넘버패드에 공통으로 있는 키들의 VK 코드
        const dualLocationKeys = new Map([
            [0x2D, 'INSERT'],     // VK_INSERT
            [0x2E, 'DELETE'],     // VK_DELETE  
            [0x24, 'HOME'],       // VK_HOME
            [0x23, 'END'],        // VK_END
            [0x21, 'PAGE_UP'],    // VK_PRIOR (Page Up)
            [0x22, 'PAGE_DOWN'],  // VK_NEXT (Page Down)
            [0x25, 'LEFT'],       // VK_LEFT
            [0x26, 'UP'],         // VK_UP
            [0x27, 'RIGHT'],      // VK_RIGHT
            [0x28, 'DOWN'],       // VK_DOWN
            [0x0D, 'ENTER'],      // VK_RETURN (Enter)
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
            0x6A, // VK_MULTIPLY (*)
            0x6B, // VK_ADD (+)
            0x6C, // VK_SEPARATOR
            0x6D, // VK_SUBTRACT (-)
            0x6E, // VK_DECIMAL (.)
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
    static getEnhancedKeyName(event: IGlobalKeyEvent): string {
        const location = this.getKeyLocation(event);
        const baseName = event.name || event.rawKey?.name || 'UNKNOWN';

        if (location === 'numpad') {
            // 이미 "NUMPAD"로 시작하지 않는 경우에만 추가
            if (!baseName.startsWith('NUMPAD')) {
                return `NUMPAD ${baseName}`;
            }
        } else if (location === 'main') {
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
    static isKeyAtLocation(
        event: IGlobalKeyEvent, 
        keyName: string, 
        location: 'main' | 'numpad' | 'any' = 'any'
    ): boolean {
        const eventKeyName = event.name || event.rawKey?.name;
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
    static getDebugInfo(event: IGlobalKeyEvent): string {
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