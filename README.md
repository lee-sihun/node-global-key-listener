# node-global-key-listener-extended

Node.js 환경에서 전역 키보드 이벤트를 후킹할 수 있는 패키지입니다.

오픈소스 키뷰어 [DM Note](https://github.com/lee-sihun/djmax-keyviewer) 개발에 사용하기 위한 목적으로 [LaunchMenu/node-global-key-listener](https://github.com/LaunchMenu/node-global-key-listener)에서 포크되었습니다.

## 변경점

이 라이브러리는 [LaunchMenu/node-global-key-listener](https://github.com/LaunchMenu/node-global-key-listener)를 기반으로 다음과 같은 개선 사항과 변경점이 적용되었습니다.

| 기능              | node-global-key-listener                                           | node-global-key-listener-extended                   |
| :---------------- | :------------------------------------------------------------------ | :-------------------------------------------- |
| **동작 방식**     | 별도의 `WinKeyServer.exe` 실행 (out-of-process)                      | 네이티브 애드온 (in-process)                 |
| **키 위치 구분**  | 메인 키보드와 넘버패드의 동일 키 구분 불가능 (예: Enter, Insert)      | 위치 구분 지원 (`isExtended` 플래그 추가) |
| **이벤트 필터링** | 일부 키 조합에서 비정상적인 이벤트 발생                            | 비정상적인 이벤트 필터링      |
| **유틸리티**      | 유틸리티 함수 부재                                              | `KeyboardUtils` 제공 |
| **플랫폼 지원**   | Windows, Mac, Linux                                               | **Windows 전용**              |

<!--
### 상세 변경 내역

#### 1. 네이티브 애드온(DLL) 방식으로 완전 전환

-   **문제점:** 기존의 `WinKeyServer.exe`를 별도 프로세스로 실행하는 방식은 일부 바이러스 백신에서 악성 행위로 오탐하는 문제가 있었습니다.
-   **해결책:** 모든 키 후킹 로직을 C++ 네이티브 애드온(`.node` 파일)으로 구현했습니다. 이제 모든 코드가 Node.js 프로세스 내부에서 직접 실행되므로, 바이러스 오탐 문제를 근본적으로 해결하고 성능을 크게 향상시켰습니다.

#### 2. 비정상적인 Shift 키 이벤트 필터링

-   **문제점:** NumLock이 켜진 상태에서 Shift 키를 누른 채로 넘버패드 키를 입력하면, 원치 않는 가상 Shift 키 이벤트가 반복적으로 발생하여 키 입력이 깜빡이는 현상이 있었습니다.
-   **해결책:** Windows 시스템에서 발생하는 비정상적인 스캔 코드(`554`)를 가진 가상 Shift 이벤트를 감지하고 필터링하는 로직을 추가하여, 더 정확하고 안정적인 키 입력을 보장합니다. (관련 커밋: `f88ded3`)

#### 3. 확장 키(Extended Key) 정보 추가

-   **문제점:** 원본 라이브러리는 메인 키보드의 `Enter`와 넘버패드의 `Enter`를 구분할 수 없었습니다. `Insert`, `Delete` 등 다른 키들도 마찬가지였습니다.
-   **해결책:** Windows의 확장 키 플래그(`isExtended`) 정보를 이벤트 객체에 포함시켰습니다. 이를 통해 메인 키보드의 특수 키와 넘버패드의 동일한 키를 명확하게 구분할 수 있게 되었습니다. (관련 커밋: `5055e98`)

#### 4. `KeyboardUtils` 유틸리티 추가

-   `isExtended` 플래그를 더 쉽게 활용할 수 있도록 `KeyboardUtils` 클래스를 추가했습니다. 이 유틸리티를 사용하면 키의 정확한 위치(`main` 또는 `numpad`)를 쉽게 판별하고, 위치 정보가 포함된 향상된 키 이름을 얻을 수 있습니다. (관련 커밋: `b46ed5a`)

```typescript
import {KeyboardUtils} from "node-global-key-listener";

v.addListener(function (e, down) {
    // 넘버패드 Enter 키만 감지하고 싶을 때
    if (KeyboardUtils.isKeyAtLocation(e, "ENTER", "numpad")) {
        console.log("넘버패드 Enter 키 감지!");
    }
});
```
-->
