#pragma once


class UiApp : public Storm::Trackable<>
{
    std::uint32_t overlayMagicMsg_ =0;
    std::mutex uilock_;
    HHOOK msgHook_ = nullptr;
    HHOOK wndProcHook_ = nullptr;
    HHOOK wndRetProcHook_ = nullptr;
    std::atomic<HWND> graphicsWindow_ = false;
    std::atomic<bool> windowFocus_ = false;
    RECT windowClientRect_ = {};

    std::mutex taskLock_;
    std::deque<std::function<void()>> tasks_;

#if ALLOW_ASSOC_SYSIME
    HIMC IMC_ = nullptr;
    HIMC originalIMC_ = nullptr;
#endif

bool isInterceptingMouseAuto_ = false;

public:
    UiApp();
    ~UiApp();

    bool trySetupGraphicsWindow(HWND window);

    bool setup(HWND window);

    HWND window() const;
    bool windowSetted() const;
    bool windowFocused() const;

    void async(const std::function<void()>& task);

    bool shouldBlockOrginalMouseInput();
    bool shouldBlockOrginalKeyInput();
    bool shouldBlockOrginalCursorViz();

    bool isInterceptingInput();

    void startAutoIntercept();
    void stopAutoIntercept();

    bool hookWindow(HWND window);
    void unhookWindow();

    void updateWindowState(HWND window);
    void clearWindowState();

    std::uint32_t gameWidth() const;
    std::uint32_t gameHeight() const;

private:

    static LRESULT CALLBACK GetMsgProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam);
    static LRESULT CALLBACK CallWndProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam);
    static LRESULT CALLBACK CallWndRetProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam);

    LRESULT hookGetMsgProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam);
    LRESULT hookCallWndProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam);
    LRESULT hookCallWndRetProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam);

    bool checkHotkey();

    void _runTask();

    bool _setCusror();
};
