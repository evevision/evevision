#pragma once

namespace overlay_game
{
struct Hotkey
{
    std::string name;
    int vkey;
    bool ctrl;
    bool shift;
    bool alt;
};

struct DxgiHookInfo
{
    HMODULE dxgiDll = nullptr;
    HMODULE d3d11Dll = nullptr;

    bool presentHooked = false;
    bool present1Hooked = false;
    bool resizeBufferHooked = false;
    bool resizeTargetHooked = false;

    std::map<std::string, std::string> toMap() const
    {
        return {
            {"type", "DXGI"},
            {"dxgiDll", std::to_string((std::uint64_t)dxgiDll)},
            {"d3d11Dll", std::to_string((std::uint64_t)d3d11Dll)},
        };
    }
};

} // namespace overlay_game

class DXGIHook;
class InputHook;

namespace session
{
HMODULE loadModuleD3dCompiler47();

overlay_game::DxgiHookInfo &dxgiHookInfo();

DXGIHook *dxgiHook();

bool dxgiHooked();

bool tryDxgiHook();

void clearDxgiHook();

InputHook *inputHook();

bool inputHooked();
bool tryInputHook();

void setInjectWindow(HWND window);
HWND injectWindow();

void setGraphicsWindow(HWND window);
HWND graphicsWindow();

void setWindowTitle(std::string title);
std::string windowTitle();

std::uint32_t hookAppThreadId();
void setHookAppThreadId(DWORD id);

std::uint32_t windowThreadId();
void setWindowThreadId(DWORD id);

std::uint32_t graphicsThreadId();
void setGraphicsThreadId(DWORD id);

void setGraphicsActive(bool active);
bool graphicsActive();

void setIsWindowed(bool windowed);
bool isWindowed();

void setOverlayConnected(bool restarted);
bool overlayConnected();

void setOverlayEnabled(bool v);
bool overlayEnabled();

} // namespace session
