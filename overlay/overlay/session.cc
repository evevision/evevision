#include "stable.h"
#include "graphics/dxgihook.h"
#include "hook/inputhook.h"
#include "hookapp.h"
#include "overlay.h"
#include "session.h"

namespace session
{
std::atomic<HWND> g_injectWindow = nullptr;
std::atomic<HWND> g_graphicsWindow = nullptr;

std::uint32_t hookAppThreadId_ = 0;
std::uint32_t windowThreadId_ = 0;
std::uint32_t graphicsThreadId_ = 0;
std::string windowTitle_;

overlay_game::DxgiHookInfo dxgiHookInfo_;

std::atomic<bool> dxgiHooked_ = false;

std::unique_ptr<DXGIHook> dxgiHook_;

std::atomic<bool> inputHooked_ = false;
std::unique_ptr<InputHook> inputHook_;

std::atomic<bool> graphicsActive_ = false;
std::atomic<bool> windowed_ = false;

std::atomic<bool> overlayConnected_ = false;
std::atomic<bool> overlayEnabled_ = true;

HMODULE hModuleD3dCompiler47_ = nullptr;

DXGIHook *dxgiHook()
{
    return dxgiHook_.get();
}

bool dxgiHooked()
{
    return dxgiHooked_;
}

bool tryDxgiHook()
{
    CHECK_THREAD(Threads::HookApp);
    dxgiHook_ = std::make_unique<DXGIHook>();

    if (dxgiHook_->hook())
    {
        dxgiHooked_ = true;
    }
    else
    {
        dxgiHook_.reset();
    }

    return dxgiHooked_;
}

void clearDxgiHook()
{
    CHECK_THREAD(Threads::HookApp);

    dxgiHook_ = nullptr;
    dxgiHooked_ = false;
}

InputHook *inputHook()
{
    return inputHook_.get();
}

bool inputHooked()
{
    return inputHooked_;
}

bool tryInputHook()
{
    CHECK_THREAD(Threads::HookApp);

    inputHook_ = std::make_unique<InputHook>();
    if (inputHook_->hook())
    {
        inputHooked_ = true;
    }
    else
    {
        inputHook_.reset();
    }

    return inputHooked_;
}

HMODULE loadModuleD3dCompiler47()
{
    CHECK_THREAD(Threads::Graphics);

    if (!hModuleD3dCompiler47_)
    {
        hModuleD3dCompiler47_ = LoadLibraryW(L"d3dcompiler_47.dll");
        if (!hModuleD3dCompiler47_)
        {
            hModuleD3dCompiler47_ = LoadLibraryW(HookApp::instance()->overlayConnector()->d3dcompiler47Path().c_str());
        }
    }

    return hModuleD3dCompiler47_;
}

overlay_game::DxgiHookInfo &dxgiHookInfo()
{
    return dxgiHookInfo_;
}

std::uint32_t hookAppThreadId()
{
    return hookAppThreadId_;
}

void setHookAppThreadId(DWORD id)
{
    hookAppThreadId_ = id;
}

std::uint32_t windowThreadId()
{
    return windowThreadId_;
}

void setWindowThreadId(DWORD id)
{
    windowThreadId_ = id;
}

std::string windowTitle() {
    return windowTitle_;
}

void setWindowTitle(std::string title) {
    __trace__ << title;
    windowTitle_ = title;
}

std::uint32_t graphicsThreadId()
{
    return graphicsThreadId_;
}

void setGraphicsThreadId(DWORD id)
{
    graphicsThreadId_ = id;
}

void setInjectWindow(HWND window)
{
    g_injectWindow = window;
}

HWND injectWindow()
{
    return g_injectWindow;
}

void setGraphicsWindow(HWND window)
{
    g_graphicsWindow = window;
    setWindowThreadId(GetWindowThreadProcessId(window, nullptr));
}

HWND graphicsWindow()
{
    return g_graphicsWindow;
}

void setGraphicsActive(bool active)
{
    graphicsActive_ = active;
}

bool graphicsActive()
{
    return graphicsActive_;
}

void setIsWindowed(bool windowed)
{
    windowed_ = windowed;
}

bool isWindowed()
{
    return windowed_;
}

void setOverlayConnected(bool value)
{
    overlayConnected_ = value;
}

bool overlayConnected()
{
    return overlayConnected_;
}

void setOverlayEnabled(bool value)
{
    overlayEnabled_ = value;
}

bool overlayEnabled()
{
    return overlayEnabled_;
}

} // namespace session
