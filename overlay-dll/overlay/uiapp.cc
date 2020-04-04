#include "stable.h"
#include "session.h"
#include "overlay.h"
#include "uiapp.h"
#include "hookapp.h"
#include "hook/inputhook.h"
#include "hotkey/hotkeycheck.h"

#if ALLOW_ASSOC_SYSIME
#pragma comment(lib, "imm32.lib")
#endif

#define  OVERLAY_MAGIC 0x908988
#define  OVERLAY_TASK 0x908987

UiApp::UiApp()
{
    overlayMagicMsg_ = RegisterWindowMessageW(L"evevision_overlay_0x010101");
    if (overlayMagicMsg_ == 0)
    {
        overlayMagicMsg_ = WM_USER + 0x88;
    }

    HookApp::instance()->overlayConnector()->remoteConnectEvent().add([this](){
        __trace__ << "remote connect event";
        if (this->graphicsWindow_) {
            HookApp::instance()->overlayConnector()->sendGraphicsWindowSetupInfo(windowClientRect_.right - windowClientRect_.left, windowClientRect_.bottom - windowClientRect_.top, windowFocus_);
        }
    }, this);
}

UiApp::~UiApp()
{
}

bool UiApp::trySetupGraphicsWindow(HWND window)
{
    WCHAR title[256] = {};
    GetWindowTextW(window, title, 256);
    __trace__ << "window: " << window << ", title:" << title;

    if (session::graphicsWindow() && window != session::graphicsWindow())
    {
        return false;
    }

    if (graphicsWindow_ == window)
    {
        return true;
    }

    if (graphicsWindow_)
    {
        unhookWindow();
        graphicsWindow_ = nullptr;
    }

    return setup(window);
}

bool UiApp::setup(HWND window)
{
    std::lock_guard<std::mutex> lock(uilock_);

    bool focused = GetForegroundWindow() == window;
    RECT rect = { 0 };
    GetClientRect(window, &rect);

    if (hookWindow(window))
    {
        graphicsWindow_ = window;

        windowFocus_ = focused;
        windowClientRect_ = rect;
        
        HookApp::instance()->overlayConnector()->sendGraphicsWindowSetupInfo(rect.right - rect.left, rect.bottom - rect.top, focused);

        return true;
    }
    else
    {
        unhookWindow();
        return false;
    }
}

HWND UiApp::window() const
{
    return graphicsWindow_.load();
}

bool UiApp::windowSetted() const
{
    return !!graphicsWindow_.load();
}

bool UiApp::windowFocused() const
{
    return windowFocus_;
}

void UiApp::async(const std::function<void()>& task)
{
    DAssert(session::graphicsWindow());

    std::lock_guard<std::mutex> lock(taskLock_);
    tasks_.push_back(task);

    PostMessage(graphicsWindow_, overlayMagicMsg_, OVERLAY_MAGIC, OVERLAY_TASK);
}

void UiApp::startAutoIntercept()
{
  // NOTE: confirmed to be called when mouse rolls around inside one of our overlay windows
    if (session::overlayEnabled())
    {
        if (!isInterceptingMouseAuto_)
        {
          //__trace__ << "auto intercept enabled";
            isInterceptingMouseAuto_ = true;
        }
    }
}

void UiApp::stopAutoIntercept()
{
    // NOTE: confirmed to be called when mouse rolls around outside of our overlay windows
    if (session::overlayEnabled())
    {
        if (isInterceptingMouseAuto_)
        {
          //__trace__ << "auto intercept disabled";
            isInterceptingMouseAuto_ = false;
            // clear hover
            HookApp::instance()->overlayConnector()->clearHover();
        }
    }
}

bool UiApp::shouldBlockOrginalMouseInput()
{
    return isInterceptingMouseAuto_;
}

bool UiApp::shouldBlockOrginalKeyInput()
{
    return isInterceptingMouseAuto_;
}

bool UiApp::shouldBlockOrginalCursorViz()
{
     return isInterceptingMouseAuto_;
}

bool UiApp::isInterceptingInput()
{
    return isInterceptingMouseAuto_;
}

bool UiApp::hookWindow(HWND window)
{
    DWORD threadId = ::GetWindowThreadProcessId(window, nullptr);

    msgHook_ = SetWindowsHookExW(WH_GETMESSAGE, GetMsgProc, NULL, threadId);
    wndProcHook_ = SetWindowsHookExW(WH_CALLWNDPROC, CallWndProc, NULL, threadId);
    wndRetProcHook_ = SetWindowsHookExW(WH_CALLWNDPROCRET, CallWndRetProc, NULL, threadId);

    return msgHook_ != nullptr && wndProcHook_ != nullptr && wndRetProcHook_ != nullptr;
}

void UiApp::unhookWindow()
{
    if (msgHook_)
    {
        UnhookWindowsHookEx(msgHook_);
        msgHook_ = nullptr;
    }
    if (wndProcHook_)
    {
        UnhookWindowsHookEx(wndProcHook_);
        wndProcHook_ = nullptr;
    }
    if (wndRetProcHook_)
    {
        UnhookWindowsHookEx(wndRetProcHook_);
        wndRetProcHook_ = nullptr;
    }
}

void UiApp::updateWindowState(HWND window)
{
    windowFocus_ = GetForegroundWindow() == window;

    GetClientRect(window, &windowClientRect_);
}

void UiApp::clearWindowState()
{
    windowClientRect_ = {0};
    windowFocus_ = 0;
}

std::uint32_t UiApp::gameWidth() const
{
    return windowClientRect_.right - windowClientRect_.left;
}

std::uint32_t UiApp::gameHeight() const
{
    return windowClientRect_.bottom - windowClientRect_.top;
}

LRESULT CALLBACK UiApp::GetMsgProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam)
{
    return HookApp::instance()->uiapp()->hookGetMsgProc(nCode, wParam, lParam);
}

LRESULT CALLBACK UiApp::CallWndProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam)
{
    return HookApp::instance()->uiapp()->hookCallWndProc(nCode, wParam, lParam);
}

LRESULT CALLBACK UiApp::CallWndRetProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam)
{
    return HookApp::instance()->uiapp()->hookCallWndRetProc(nCode, wParam, lParam);
}

LRESULT UiApp::hookGetMsgProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam)
{
    if (nCode >= 0)
    {
        if (session::graphicsActive())
        {
            MSG* pMsg = (MSG*)lParam;
            if (pMsg->hwnd == graphicsWindow_ && wParam == PM_REMOVE)
            {
                if (pMsg->message == WM_KEYDOWN || pMsg->message == WM_SYSKEYDOWN
                    || pMsg->message == WM_KEYUP || pMsg->message == WM_SYSKEYUP)
                {
                    if (checkHotkey())
                    {
                        return 0;
                    }
                }

                if (pMsg->message == overlayMagicMsg_ && pMsg->wParam == OVERLAY_MAGIC)
                {
                    if (pMsg->lParam == OVERLAY_TASK)
                    {
                        _runTask();
                    }
                }

                if (!isInterceptingMouseAuto_ && !HookApp::instance()->overlayConnector()->isMousePressingOnOverlayWindow())
                {
                  // mouse command outside of an overlay window
                  if (pMsg->message == WM_LBUTTONDOWN)
                  {
                      HookApp::instance()->overlayConnector()->clearFocus();
                  }

                  return CallNextHookEx(msgHook_, nCode, wParam, lParam);
                }

                if (pMsg->message >= WM_MOUSEFIRST && pMsg->message <= WM_MOUSELAST)
                {
                  // mouse command inside of an overlay window
                    POINTS pt = MAKEPOINTS(pMsg->lParam);

                    if (overlay_game::pointInRect(pt, windowClientRect_))
                    {
                      if (!HookApp::instance()->overlayConnector()->processMouseMessage(pMsg->message, pMsg->wParam, pMsg->lParam))
                      {
                            if (pMsg->message == WM_LBUTTONUP
                                || pMsg->message == WM_MBUTTONUP)
                            {
                                async([this]() { this->stopAutoIntercept(); });
                            }
                        }
                        pMsg->message = WM_NULL;
                        return 0;
                    }
                }

                if ((pMsg->message >= WM_KEYFIRST && pMsg->message <= WM_KEYLAST)
                    || (pMsg->message >= WM_SYSKEYDOWN && pMsg->message <= WM_SYSDEADCHAR))
                {
                    bool inputHandled = HookApp::instance()->overlayConnector()->processkeyboardMessage(pMsg->message, pMsg->wParam, pMsg->lParam);
                    if (inputHandled)
                    {
                        if (pMsg->message == WM_KEYDOWN) // TODO: keyup?
                        {
                            TranslateMessage(pMsg);
                        }
                        pMsg->message = WM_NULL;
                    }
                    return 0;
                }
            }
        }
    }
    return CallNextHookEx(msgHook_, nCode, wParam, lParam);
}

LRESULT UiApp::hookCallWndProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam)
{
    if (nCode >= 0)
    {
        CWPSTRUCT* cwp = (CWPSTRUCT*)lParam;

        if (cwp->hwnd == graphicsWindow_)
        {
            if (cwp->message == WM_DESTROY)
            {
                __trace__ << L"WM_DESTROY, " << graphicsWindow_;

                HookApp::instance()->overlayConnector()->sendGraphicsWindowDestroy();

                unhookWindow();
                graphicsWindow_ = nullptr;

                HookApp::instance()->quit();
            }
            else if (cwp->message == WM_SIZE)
            {
                GetClientRect(graphicsWindow_, &windowClientRect_);
                HookApp::instance()->overlayConnector()->sendGraphicsWindowResizeEvent(windowClientRect_.right - windowClientRect_.left, windowClientRect_.bottom - windowClientRect_.top);
            }

            else if (cwp->message == WM_KILLFOCUS)
            {
                windowFocus_ = false;
                HookApp::instance()->overlayConnector()->sendGraphicsWindowFocusEvent(windowFocus_);
                stopAutoIntercept();

            }
            else if (cwp->message == WM_SETFOCUS)
            {
                windowFocus_ = true;
                HookApp::instance()->overlayConnector()->sendGraphicsWindowFocusEvent(windowFocus_);
            }
            else if (cwp->message == WM_SETCURSOR && LOWORD(cwp->lParam) == HTCLIENT)
            {
                if (_setCusror())
                {
                    return 0;
                }
            }
            else if (cwp->message == WM_NCHITTEST)
            {
              HookApp::instance()->overlayConnector()->processNCHITTEST(cwp->message, cwp->wParam, cwp->lParam) ? startAutoIntercept() : stopAutoIntercept();
            }
        }
    }

    return CallNextHookEx(wndProcHook_, nCode, wParam, lParam);
}

LRESULT UiApp::hookCallWndRetProc(_In_ int nCode, _In_ WPARAM wParam, _In_ LPARAM lParam)
{
    if (nCode >= 0)
    {
        CWPRETSTRUCT * cwp = (CWPRETSTRUCT *)lParam;

        if (cwp->hwnd == graphicsWindow_)
        {
            if (cwp->message == WM_SETCURSOR && LOWORD(cwp->lParam) == HTCLIENT)
            {
                if (_setCusror())
                {
                    return 0;
                }
            }
        }
    }
    return CallNextHookEx(wndRetProcHook_, nCode, wParam, lParam);
}

bool UiApp::checkHotkey()
{
#ifndef HOTKEY_THREADED
    HotkeyCheck::instance()->checkHotkeys();
#endif // HOTKEY_THREADED

    return false;
}

void UiApp::_runTask()
{
    std::deque<std::function<void()>> tasks;
    {
        std::lock_guard<std::mutex> lock(taskLock_);
        tasks.swap(tasks_);
    }

    for (auto& task : tasks)
    {
        task();
    }
}

bool UiApp::_setCusror()
{
    if (isInterceptingMouseAuto_)
    {
        if (HookApp::instance()->overlayConnector()->processSetCursor())
        {
            return true;
        }
    }

    return false;
}
