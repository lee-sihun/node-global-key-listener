import { IGlobalKeyEvent } from "../_types/IGlobalKeyEvent";
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
export declare class KeyboardUtils {
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
    static getKeyLocation(event: IGlobalKeyEvent): 'main' | 'numpad' | 'unknown';
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
    static getEnhancedKeyName(event: IGlobalKeyEvent): string;
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
    static isKeyAtLocation(event: IGlobalKeyEvent, keyName: string, location?: 'main' | 'numpad' | 'any'): boolean;
    /**
     * 디버깅용: 키 이벤트의 상세 정보를 문자열로 반환
     * @param event 키보드 이벤트
     * @returns 디버깅 정보 문자열
     */
    static getDebugInfo(event: IGlobalKeyEvent): string;
}
//# sourceMappingURL=KeyboardUtils.d.ts.map