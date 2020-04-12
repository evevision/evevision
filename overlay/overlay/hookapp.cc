#include "stable.h"
#include "session.h"
#include "hookapp.h"
#include "graphics/dxgihook.h"
#include "hook/inputhook.h"
#include "hotkey/hotkeycheck.h"
#include <Windows.h>
#include "core/corerunloop.h"

HANDLE g_hookAppThread = nullptr;


DWORD WINAPI HookAppThread(
    _In_ LPVOID
)
{
    OutputDebugStringA("n HookAppThread enter");
    unsigned res = 0;
    __try
    {
        HookApp::instance()->hookThread();
    }
    __except (EXCEPTION_EXECUTE_HANDLER)
    {
        res = -1;
        OutputDebugStringA("n HookAppThread exception");
    }

    OutputDebugStringA("n HookAppThread quit");
    return res;
}

DWORD WINAPI hookLoopThread(_In_ LPVOID)
{
  while (!HookApp::instance()->isQuitSet())
  {
      auto window = GetForegroundWindow();
      DWORD processId = 0;
      GetWindowThreadProcessId(window, &processId);
      if (processId != GetCurrentProcessId())
      {
          Sleep(1000);
          continue;
      }

      HookApp::instance()->deferHook();

      Sleep(1000);
  }

    return 0;
}

HookApp::HookApp()
    : hookQuitedEvent_(true)
{
    processPath_ = win_utils::applicationProcPath();
    processName_ = win_utils::applicationProcName();
}

HookApp::~HookApp()
{

}

void HookApp::initialize()
{
    MH_Initialize();

    g_hookAppThread = HookApp::instance()->start();
}

void HookApp::uninitialize()
{
    if (g_hookAppThread)
    {
        HookApp::instance()->quit();

        if (WaitForSingleObject(g_hookAppThread, 1000) != WAIT_OBJECT_0)
        {
            TerminateThread(g_hookAppThread, 0);
        }
    }

    MH_Uninitialize();
}

HookApp * HookApp::instance()
{
    static HookApp hookApp;
    return &hookApp;
}

HANDLE HookApp::start()
{
    return ::CreateThread(nullptr, 0, HookAppThread, nullptr, 0, nullptr);

}

void HookApp::quit()
{
    __trace__;

    quitFlag_ = true;

    async([this]() {
        std::lock_guard<std::mutex> lock(runloopLock_);
        runloop_->quit();
    });

    hookQuitedEvent_.wait(5000);
}

void HookApp::startHook()
{
    CHECK_THREAD(Threads::HookApp);

    __trace__;

    if (!hookFlag_)
    {
        hookFlag_ = true;
        hookloopThread_ = CreateThread(nullptr, 0, hookLoopThread, nullptr, 0, nullptr);
    }
}

void HookApp::async(const std::function<void()>& task)
{
    std::lock_guard<std::mutex> lock(runloopLock_);
    {
        if (runloop_)
        {
            runloop_->post(task);
        }
    }
}

void HookApp::deferHook()
{
    if (!quitFlag_ && !session::graphicsActive())
    {
        async([this]() { 
            hook();
        });
    }
}

void HookApp::hookThread()
{
    __trace__ << "hook thread start ... ";

    session::setHookAppThreadId(::GetCurrentThreadId());

    {
        std::lock_guard<std::mutex> lock(runloopLock_);
        runloop_.reset(new Storm::CoreRunloop());
    }

    overlay_.reset(new OverlayConnector());
    overlay_->start();

    uiapp_.reset(new UiApp());

    runloop_->post([this]() {
        this->findGameWindow();
    });

    __trace__ << "running runloop";
    runloop_->run();
    __trace__ << "exited runloop";

    {
        std::lock_guard<std::mutex> lock(runloopLock_);
        runloop_.reset(nullptr);
    }

    unhookGraphics();

    overlay_->quit();
    overlay_.reset();

    hookQuitedEvent_.set();

    __trace__ << "@trace hook thread exit... ";
}

struct FindWindowParam {
    DWORD processId;
    HWND window;
};

BOOL CALLBACK findGraphicsWindow(HWND hwnd, LPARAM lParam)
{
    FindWindowParam* param = (FindWindowParam*)lParam;

    DWORD processId = NULL;

    GetWindowThreadProcessId(hwnd, &processId);

    if (processId != param->processId)
    {
        return TRUE;
    }

    if (!IsWindowVisible(hwnd))
    {
        return TRUE;
    }

    WCHAR title[MAX_PATH] = { 0 };
    GetWindowTextW(hwnd, title, MAX_PATH);
    if (wcsstr(title, L"Debug") != nullptr)
    {
        return TRUE;
    }

    param->window = hwnd;
    return FALSE;
}

bool HookApp::findGameWindow()
{
    if (session::graphicsWindow() && !session::windowTitle().empty())
    {
        return true;
    }

    HWND injectWindow = session::injectWindow();
    if (injectWindow)
    {

        while (true) {
            char windowTitle[256];
            GetWindowTextA(injectWindow, windowTitle, sizeof(windowTitle));

            if (((std::string)windowTitle).rfind("EVE - ") == 0) {
                session::setWindowTitle(windowTitle);
                __trace__ << "setGraphicsWindow by injectWindow: " << injectWindow;
                session::setGraphicsWindow(injectWindow);
                overlay_->connect();
                return true;
            }
            else {
                __trace__ << "EVE window does not have correct title: " << windowTitle;
            }

            Sleep(1000);
        }
    }
    else
    {
        FindWindowParam param = {0};
        param.processId = GetCurrentProcessId();

        EnumWindows(findGraphicsWindow, (LPARAM)&param);

        if (param.window)
        {
            while (true) {
                char windowTitle[256];
                GetWindowTextA(param.window, windowTitle, sizeof(windowTitle));

                if (((std::string)windowTitle).rfind("EVE - ") == 0) {
                    session::setWindowTitle(windowTitle);
                    __trace__ << "setGraphicsWindow by enum: " << param.window;
                    // bruh its gettin set right here wut
                    session::setGraphicsWindow(param.window);
                    overlay_->connect();
                    return true;
                }
                else {
                    __trace__ << "EVE window does not have correct title: " << windowTitle;
                }
                Sleep(1000);
            }

        }
    }

    return false;
}

void HookApp::hook()
{
    if (!findGameWindow())
    {
        __trace__ << "no find game";
        return;
    }

    __trace__ << "hooking input";
    if (!hookInput())
    {
        __trace__ << "no hook input";
        return;
    }

    __trace__ << "hooking window";
    if (!hookWindow())
    {
        __trace__ << "no hook window";
        return;
    }

    __trace__ << "hooking graphics";
    hookGraphics();
}

bool HookApp::hookWindow()
{
    DAssert(session::graphicsWindow());

    return uiapp_->trySetupGraphicsWindow(session::graphicsWindow());
}

void HookApp::unhookGraphics()
{
    if (session::dxgiHooked())
    {
        session::dxgiHook()->unhook();
        session::clearDxgiHook();
    }
}

void HookApp::hookGraphics()
{
    if (!session::dxgiHooked())
    {
        hookDXGI();
    }
}

bool HookApp::hookInput()
{
    if (!session::inputHooked())
    {
        session::tryInputHook();

        std::cout << __FUNCTION__ << ", " << session::inputHooked() << std::endl;
    }

    return session::inputHooked();
}

bool HookApp::hookDXGI()
{
    if (!session::dxgiHooked())
    {
        session::tryDxgiHook();
    }

    std::cout << __FUNCTION__ << ", " << session::dxgiHooked() << std::endl;
    return session::dxgiHooked();
}
