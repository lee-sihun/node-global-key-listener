#include <napi.h>
#include <windows.h>
#include <thread>
#include <future>

// --- 전역 변수 ---
HHOOK hKeyboardHook = NULL;
Napi::ThreadSafeFunction tsfn;
std::thread hookThread;
DWORD hookThreadId = 0;

// --- 키 상태 열거형 ---
enum KeyState
{
    KEY_DOWN,
    KEY_UP
};

// --- 키보드 이벤트 콜백 함수 ---
LRESULT CALLBACK KeyboardEvent(int nCode, WPARAM wParam, LPARAM lParam)
{
    if (nCode == HC_ACTION && tsfn)
    {
        // lParam은 콜백 함수 내에서만 유효하므로, 데이터를 복사해서 사용해야 합니다.
        KBDLLHOOKSTRUCT *keyData = new KBDLLHOOKSTRUCT(*(KBDLLHOOKSTRUCT *)lParam);
        KeyState ks;

        if (wParam == WM_KEYDOWN || wParam == WM_SYSKEYDOWN)
        {
            ks = KEY_DOWN;
        }
        else if (wParam == WM_KEYUP || wParam == WM_SYSKEYUP)
        {
            ks = KEY_UP;
        }
        else
        {
            delete keyData; // 처리하지 않는 이벤트는 메모리 해제
            return CallNextHookEx(hKeyboardHook, nCode, wParam, lParam);
        }

        // 가상 Shift 이벤트 필터링
        if ((keyData->vkCode == VK_SHIFT || keyData->vkCode == VK_LSHIFT || keyData->vkCode == VK_RSHIFT) &&
            ((keyData->flags & LLKHF_INJECTED) || keyData->scanCode == 554))
        {
            delete keyData; // 필터링된 이벤트는 메모리 해제
            return CallNextHookEx(hKeyboardHook, nCode, wParam, lParam);
        }

        // JavaScript 콜백에 전달할 데이터와 로직
        auto callback = [ks](Napi::Env env, Napi::Function jsCallback, KBDLLHOOKSTRUCT *data)
        {
            Napi::Object obj = Napi::Object::New(env);
            obj.Set("state", Napi::String::New(env, (ks == KEY_DOWN ? "DOWN" : "UP")));
            obj.Set("vkCode", Napi::Number::New(env, data->vkCode));
            obj.Set("scanCode", Napi::Number::New(env, data->scanCode));
            obj.Set("isExtended", Napi::Boolean::New(env, (data->flags & LLKHF_EXTENDED) != 0));
            jsCallback.Call({obj});
            delete data; // JavaScript로 데이터 전달 후 메모리 해제
        };

        // 메인 스레드를 막지 않는 NonBlockingCall 사용
        tsfn.NonBlockingCall(keyData, callback);
    }

    return CallNextHookEx(hKeyboardHook, nCode, wParam, lParam);
}

// --- 훅 전용 스레드 메인 함수 ---
void HookThreadMain(std::promise<DWORD> promise)
{
    // 현재 스레드의 ID를 StartHook 함수로 전달
    promise.set_value(GetCurrentThreadId());

    HINSTANCE hInstance = GetModuleHandle(NULL);
    hKeyboardHook = SetWindowsHookEx(WH_KEYBOARD_LL, KeyboardEvent, hInstance, 0);

    // 훅 메시지를 처리하기 위한 표준 메시지 루프
    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    // 스레드 종료 전 훅 해제
    if (hKeyboardHook)
    {
        UnhookWindowsHookEx(hKeyboardHook);
        hKeyboardHook = NULL;
    }
}

// --- 훅 시작 함수 (JavaScript에서 호출) ---
Napi::Value StartHook(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsFunction())
    {
        Napi::TypeError::New(env, "Function expected as argument.").ThrowAsJavaScriptException();
        return env.Null();
    }

    tsfn = Napi::ThreadSafeFunction::New(
        env,
        info[0].As<Napi::Function>(),
        "Keyboard Event Handler",
        0, 1);

    std::promise<DWORD> threadIdPromise;
    std::future<DWORD> threadIdFuture = threadIdPromise.get_future();

    // 훅 전용 스레드 시작
    hookThread = std::thread(HookThreadMain, std::move(threadIdPromise));

    // 훅 스레드가 ID를 전달해줄 때까지 대기
    hookThreadId = threadIdFuture.get();

    return env.Undefined();
}

// --- 훅 중지 함수 (JavaScript에서 호출) ---
Napi::Value StopHook(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();

    if (hookThread.joinable())
    {
        // 훅 스레드의 메시지 루프를 종료시키기 위해 WM_QUIT 메시지 전송
        PostThreadMessage(hookThreadId, WM_QUIT, 0, 0);
        hookThread.join(); // 스레드가 완전히 종료될 때까지 대기
    }

    if (tsfn)
    {
        tsfn.Release();
    }

    return env.Undefined();
}

// --- 애드온 초기화 ---
Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set("start", Napi::Function::New(env, StartHook));
    exports.Set("stop", Napi::Function::New(env, StopHook));
    return exports;
}

NODE_API_MODULE(addon, Init)