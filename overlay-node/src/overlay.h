#pragma once
#include <napi.h>
#include "utils/n-utils.h"
#include "utils/node_async_call.h"
#include <assert.h>
#include <set>
#include <memory>
#include <mutex>
#include <iostream>
#include "ipc/tinyipc.h"
#include "utils/win-utils.h"
#include "utils/share_mem.h"
#include <locale>
#include <codecvt>
#include <string>
#include <regex>
#include <algorithm>
#include <map>
#include "CursorCommand.h"
#include "ClientMessageContainer.h"

#define OVERLAY_DISPATCH(type) \
case EveVision::IPC::GameMessage::##type:\
{\
    _on##type(link->remoteIdentity(), container->message_as_##type()); \
    break; \
}\

namespace stdxx
{
    namespace
    {
        static constexpr unsigned int Fnv1aBasis = 0x811C9DC5;
        static constexpr unsigned int Fnv1aPrime = 0x01000193;
    }

    constexpr unsigned int hash(const char *s, unsigned int h = Fnv1aBasis)
    {
        return !*s
            ? h
            : hash(
                s + 1,
                static_cast<unsigned int>(
                (h ^ *s) * static_cast<unsigned long long>(Fnv1aPrime)));
    }

    constexpr unsigned int hash(const wchar_t *s, unsigned int h = Fnv1aBasis)
    {
        return !*s
            ? h
            : hash(
                s + 1,
                static_cast<unsigned int>(
                (h ^ *s) * static_cast<unsigned long long>(Fnv1aPrime)));
    }
}

struct share_memory
{
    std::string bufferName;
    std::unique_ptr<windows_shared_memory> windowBitmapMem;
    int maxWidth;
    int maxHeight;
};

struct ShareMemFrameBuffer {
    int width;
    int height;
    int x;
    int y;
};

struct WindowRect {
    int width;
    int height;
    int x;
    int y;
};

struct WindowPosition {
    uint32_t windowId;
    int x;
    int y;
};

struct WindowCaptionMargin {
    int top;
    int left;
    int right;
    int height;
};

struct WindowInfo {
    uint32_t windowId;
    uint32_t nativeHandle;
    std::string name;
    bool resizable;
    int maxWidth;
    int maxHeight;
    int minWidth;
    int minHeight;
    int dragBorderWidth;
    std::string bufferName;
    WindowRect rect;
    WindowCaptionMargin caption;
};


inline bool isKeyDown(WPARAM wparam)
{
    return (GetAsyncKeyState(wparam) & 0x8000) != 0;
}

inline std::string getKeyCode(std::uint32_t key)
{
    static std::map<std::uint32_t, std::string> keyCodes = {
        {1, "LButton"},
        {2, "RButton"},
        {4 , "MButton"},
        {5 , "XButotn1"},
        {6 , "XButotn2"},
        {8 , "Backspace"},
        {9 , "Tab"},
        {13 , "Enter"},
        {16 , "Shift"},
        {17 , "Ctrl"},
        {18 , "Alt"},
        {19 , "Pause"},
        {20 , "CapsLock"},
        {27 , "Escape"},
        {32 , " "},
        {33 , "PageUp"},
        {34 , "PageDown"},
        {35 , "End"},
        {36 , "Home"},
        {37 , "Left"},
        {38 , "Up"},
        {39 , "Right"},
        {40 , "Down"},
        {45 , "Insert"},
        {46 , "Delete"},
        {48 , "0"},
        {49 , "1"},
        {50 , "2"},
        {51 , "3"},
        {52 , "4"},
        {53 , "5"},
        {54 , "6"},
        {55 , "7"},
        {56 , "8"},
        {57 , "9"},
        {65 , "A"},
        {66 , "B"},
        {67 , "C"},
        {68 , "D"},
        {69 , "E"},
        {70 , "F"},
        {71 , "G"},
        {72 , "H"},
        {73 , "I"},
        {74 , "J"},
        {75 , "K"},
        {76 , "L"},
        {77 , "M"},
        {78 , "N"},
        {79 , "O"},
        {80 , "P"},
        {81 , "Q"},
        {82 , "R"},
        {83 , "S"},
        {84 , "T"},
        {85 , "U"},
        {86 , "V"},
        {87 , "W"},
        {88 , "X"},
        {89 , "Y"},
        {90 , "Z"},
        {91 , "Meta" },
        {92 , "Meta"},
        {93 , "ContextMenu"},
        {96 , "0"},
        {97 , "1"},
        {98 , "2"},
        {99 , "3"},
        {100 , "4"},
        {101 , "5"},
        {102 , "6"},
        {103 , "7"},
        {104 , "8"},
        {105 , "9"},
        {106 , "*"},
        {107 , "+"},
        {109 , "-"},
        {110 , "."},
        {111 , "/"},
        {112 , "F1"},
        {113 , "F2"},
        {114 , "F3"},
        {115 , "F4"},
        {116 , "F5"},
        {117 , "F6"},
        {118 , "F7"},
        {119 , "F8"},
        {120 , "F9"},
        {121 , "F10"},
        {122 , "F11"},
        {123 , "F12"},
        {144 , "NumLock"},
        {145 , "ScrollLock" },
        { 160, "Shift" },
        { 161, "Shift" },
        { 162, "Control" },
        { 163, "Control" },
        { 164, "Alt" },
        {165, "Alt"},
        {182 , "My Computer"},
        {183 , "My Calculator"},
        {186 , ";"},
        {187 , "="},
        {188 , "},"},
        {189 , "-"},
        {190 , "."},
        {191 , "/"},
        {192 , "`"},
        {219 , "["},
        {220 , "\\"},
        {221 , "]"},
        { 222 , "'" },
        { 250 , "Play" },
    };

    return keyCodes[key];
}

inline std::vector<std::string> getKeyboardModifiers(WPARAM wparam, LPARAM lparam)
{
    std::vector<std::string> modifiers;
    if (isKeyDown(VK_SHIFT))
        modifiers.push_back("shift");
    if (isKeyDown(VK_CONTROL))
        modifiers.push_back("control");
    if (isKeyDown(VK_MENU))
        modifiers.push_back("alt");
    if (isKeyDown(VK_LWIN) || isKeyDown(VK_RWIN))
        modifiers.push_back("meta");

    if (::GetAsyncKeyState(VK_NUMLOCK) & 0x0001)
        modifiers.push_back("numLock");
    if (::GetAsyncKeyState(VK_CAPITAL) & 0x0001)
        modifiers.push_back("capsLock");

    switch (wparam) {
    case VK_RETURN:
        if ((lparam >> 16) & KF_EXTENDED)
            modifiers.push_back("isKeypad");
        break;
    case VK_INSERT:
    case VK_DELETE:
    case VK_HOME:
    case VK_END:
    case VK_PRIOR:
    case VK_NEXT:
    case VK_UP:
    case VK_DOWN:
    case VK_LEFT:
    case VK_RIGHT:
        if (!((lparam >> 16) & KF_EXTENDED))
            modifiers.push_back("isKeypad");
        break;
    case VK_NUMLOCK:
    case VK_NUMPAD0:
    case VK_NUMPAD1:
    case VK_NUMPAD2:
    case VK_NUMPAD3:
    case VK_NUMPAD4:
    case VK_NUMPAD5:
    case VK_NUMPAD6:
    case VK_NUMPAD7:
    case VK_NUMPAD8:
    case VK_NUMPAD9:
    case VK_DIVIDE:
    case VK_MULTIPLY:
    case VK_SUBTRACT:
    case VK_ADD:
    case VK_DECIMAL:
    case VK_CLEAR:
        modifiers.push_back("isKeypad");
        break;
    case VK_SHIFT:
        if (isKeyDown(VK_LSHIFT))
            modifiers.push_back("left");
        else if (isKeyDown(VK_RSHIFT))
            modifiers.push_back("right");
        break;
    case VK_CONTROL:
        if (isKeyDown(VK_LCONTROL))
            modifiers.push_back("left");
        else if (isKeyDown(VK_RCONTROL))
            modifiers.push_back("right");
        break;
    case VK_MENU:
        if (isKeyDown(VK_LMENU))
            modifiers.push_back("left");
        else if (isKeyDown(VK_RMENU))
            modifiers.push_back("right");
        break;
    case VK_LWIN:
        modifiers.push_back("left");
        break;
    case VK_RWIN:
        modifiers.push_back("right");
        break;
    }
    return modifiers;
}

inline std::vector<std::string> getMouseModifiers(WPARAM wparam, LPARAM lparam)
{
    std::vector<std::string> modifiers;

    WORD vkState = GET_KEYSTATE_WPARAM(wparam);
    if (vkState & MK_CONTROL)
    {
        modifiers.push_back("control");
        if (isKeyDown(VK_LCONTROL))
            modifiers.push_back("left");
        else if (isKeyDown(VK_RCONTROL))
            modifiers.push_back("right");
    }
    if (vkState & MK_SHIFT)
    {
        modifiers.push_back("shift");
        if (isKeyDown(VK_LSHIFT))
            modifiers.push_back("left");
        else if (isKeyDown(VK_RSHIFT))
            modifiers.push_back("right");
    }
    if (isKeyDown(VK_MENU))
    {
        modifiers.push_back("alt");
        if (isKeyDown(VK_LMENU))
            modifiers.push_back("left");
        else if (isKeyDown(VK_RMENU))
            modifiers.push_back("right");
    }

    if (vkState & MK_LBUTTON)
        modifiers.push_back("leftButtonDown");
    if (vkState & MK_RBUTTON)
        modifiers.push_back("rightButtonDown");
    if (vkState & MK_MBUTTON)
        modifiers.push_back("middleButtonDown");

    if (isKeyDown(VK_LWIN) || isKeyDown(VK_RWIN))
        modifiers.push_back("meta");

    if (::GetAsyncKeyState(VK_NUMLOCK) & 0x0001)
        modifiers.push_back("numLock");
    if (::GetAsyncKeyState(VK_CAPITAL) & 0x0001)
        modifiers.push_back("capsLock");

    return modifiers;
}


class OverlayMain : public IIpcHost
{
    IIpcHostCenter *ipcHostCenter_;
    std::map<std::uint32_t, IIpcLink *> ipcClients_;

    std::shared_ptr<NodeEventCallback> eventCallback_;

    std::map<std::uint32_t, std::shared_ptr<share_memory>> shareMemMap_;

    Windows::Mutex mutex_;
    std::string shareMemMutex_;

  public:
    OverlayMain()
    {
    }

    ~OverlayMain()
    {
        this->stop();
    }

    void start(std::string characterName)
    {
        std::wstring_convert<std::codecvt_utf8_utf16<wchar_t>> converter;

        this->ipcHostCenter_ = createIpcHostCenter();

        std::string correctedCharacterName = std::regex_replace(characterName, std::regex(" "), "-");
        std::transform(correctedCharacterName.begin(), correctedCharacterName.end(), correctedCharacterName.begin(),
            [](unsigned char c) { return std::tolower(c); });

        std::string mainIpcName = "evevision-overlay-" + correctedCharacterName;

        log("creating IPC host in overlay host:" + mainIpcName);

        ipcHostCenter_->init(mainIpcName, this);

        static long long pid = GetCurrentProcessId();
        static long long time = GetTickCount();

        std::wstring wideCharacterName = converter.from_bytes(correctedCharacterName);
        std::wstring name(L"evevision-overlay-" + wideCharacterName + L"-sharemem-{4C4BD948-0F75-413F-9667-AC64A7944D8E}");
        name.append(std::to_wstring(pid)).append(L"-").append(std::to_wstring(time));
        shareMemMutex_ = Windows::toUtf8(name);
        mutex_.create(false, name.c_str());
    }

    void stop()
    {
        mutex_.close();

        if (this->ipcHostCenter_)
        {
            destroyIpcHostCenter(this->ipcHostCenter_);
            this->ipcHostCenter_ = nullptr;
        }
    }

    std::shared_ptr<share_memory> createImageMem(std::uint32_t windowId, std::string bufferName, int minimumWidth, int minimumHeight)
    {
        {
            // clamp to increments of 512, minimum 512
            int maxWidth = std::max(static_cast<int>(std::ceil((float)minimumWidth / 512.0f)) * 512, 512);
            int maxHeight = std::max(static_cast<int>(std::ceil((float)minimumHeight / 512.0f)) * 512, 512);

            log("create shared mem: " + std::to_string(maxWidth) + "x" + std::to_string(maxHeight) + " (" + std::to_string(minimumWidth) + "x" + std::to_string(minimumHeight) + ")");

            auto shareMemSize = maxWidth * maxHeight * sizeof(std::uint32_t) + sizeof(ShareMemFrameBuffer);
            std::shared_ptr<share_memory> imageMem = std::make_shared<share_memory>();
            imageMem->bufferName = bufferName;
            try
            {
                windows_shared_memory share_mem(windows_shared_memory::create_only, bufferName.c_str(), shareMemSize, windows_shared_memory::read_write);

                imageMem->windowBitmapMem = std::make_unique<windows_shared_memory>(std::move(share_mem));

                std::memset(imageMem->windowBitmapMem->get_address(), 0, imageMem->windowBitmapMem->get_size());

                imageMem->maxWidth = maxWidth;
                imageMem->maxHeight = maxHeight;
            }
            catch (...)
            {
                ;
            }

            shareMemMap_[windowId] = imageMem;

            return imageMem;
        }
    }

    Napi::Value setEventCallback(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();

        Napi::Function callback = info[1].As<Napi::Function>();

        eventCallback_ = std::make_shared<NodeEventCallback>(env, Napi::Persistent(callback), Napi::Persistent(info.This().ToObject()));

        return env.Undefined();
    }

    Napi::Value sendCommand(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();

        Napi::Object commandInfo = info[1].ToObject();
        std::string command = commandInfo.Get("command").ToString();
        if (command == "cursor")
        {
            flatbuffers::FlatBufferBuilder builder;
            this->_sendMessage(&builder, EveVision::IPC::CreateCursorCommand(builder, builder.CreateString(commandInfo.Get("cursor").ToString().Utf8Value())), EveVision::IPC::ClientMessage::CursorCommand);
        }

        return env.Undefined();
    }

    Napi::Value addWindow(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();

        uint32_t windowId = info[1].ToNumber();
        Napi::Object windowDetails = info[2].ToObject();

        flatbuffers::FlatBufferBuilder builder;

        std::string bufferName = _shareMemoryName(windowId);

        flatbuffers::Offset<flatbuffers::String> nameStr = builder.CreateString(windowDetails.Get("name").ToString().Utf8Value());
        flatbuffers::Offset<flatbuffers::String> bufferNameStr = builder.CreateString(bufferName);

        EveVision::IPC::WindowInfoBuilder windowBuilder(builder);

        windowBuilder.add_windowId(windowId);
        windowBuilder.add_name(nameStr);
        windowBuilder.add_nativeHandle(windowDetails.Get("nativeHandle").ToNumber());
        windowBuilder.add_resizable(windowDetails.Get("resizable").ToBoolean());
        windowBuilder.add_maxWidth(windowDetails.Get("maxWidth").ToNumber());
        windowBuilder.add_minWidth(windowDetails.Get("minWidth").ToNumber());
        windowBuilder.add_maxHeight(windowDetails.Get("maxHeight").ToNumber());
        windowBuilder.add_minHeight(windowDetails.Get("minHeight").ToNumber());
        windowBuilder.add_bufferName(bufferNameStr);

        if (windowDetails.Has("dragBorderWidth"))
        {
            windowBuilder.add_dragBorderWidth(windowDetails.Get("dragBorderWidth").ToNumber());
        }

        Napi::Object rect = windowDetails.Get("rect").ToObject();
        windowBuilder.add_rect(&EveVision::IPC::WindowRect(rect.Get("x").ToNumber(), rect.Get("y").ToNumber(), rect.Get("width").ToNumber(), rect.Get("height").ToNumber()));

        if (windowDetails.Has("caption"))
        {
            Napi::Object caption = windowDetails.Get("caption").ToObject();
            windowBuilder.add_caption(&EveVision::IPC::WindowCaptionMargin(caption.Get("left").ToNumber(), caption.Get("right").ToNumber(), caption.Get("top").ToNumber(), caption.Get("height").ToNumber()));
        }

        createImageMem(windowId, bufferName, rect.Get("width").ToNumber(), rect.Get("height").ToNumber());

        this->_sendMessage(&builder, windowBuilder.Finish(), EveVision::IPC::ClientMessage::WindowInfo);

        return env.Undefined();
    }

    Napi::Value closeWindow(const Napi::CallbackInfo& info)
    {
        Napi::Env env = info.Env();

        flatbuffers::FlatBufferBuilder builder;
        this->_sendMessage(&builder, EveVision::IPC::CreateWindowClose(builder, info[1].ToNumber()), EveVision::IPC::ClientMessage::WindowClose);

        return env.Undefined();
    }

    Napi::Value setWindowPosition(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();

        uint32_t windowId = info[1].ToNumber();
        int x = info[2].ToNumber();
        int y = info[3].ToNumber();

        // update the shared memory map as well, otherwise it will reset position when sprites are reinitialized i.e. on resize
        auto it = shareMemMap_.find(windowId);
        if (it != shareMemMap_.end())
        {
            char *windowBitmapMemOrigin = static_cast<char *>(it->second->windowBitmapMem->get_address());
            ShareMemFrameBuffer *head = (ShareMemFrameBuffer *)windowBitmapMemOrigin; // image data header
            head->x = x;
            head->y = y;
        }

        flatbuffers::FlatBufferBuilder builder;
        this->_sendMessage(&builder, EveVision::IPC::CreateWindowPosition(builder, windowId, x, y), EveVision::IPC::ClientMessage::WindowPosition);

        return env.Undefined();
    }

    Napi::Value sendFrameBuffer(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();

        uint32_t windowId = info[1].ToNumber();

        flatbuffers::FlatBufferBuilder builder;
        bool newBuffer = false;
        flatbuffers::Offset<flatbuffers::String> newBufferStr;

        auto it = shareMemMap_.find(windowId);
        if (it != shareMemMap_.end())
        {
            char *windowBitmapMemOrigin = static_cast<char *>(it->second->windowBitmapMem->get_address());

            Napi::Object parent = info[2].ToObject();
            bool hasChild = !info[3].IsUndefined();

            bool redrawChild = false;

            Napi::Object rect = parent.Get("rect").ToObject();

            std::int32_t width = rect.Get("width").ToNumber();
            std::int32_t height = rect.Get("height").ToNumber();
            std::int32_t x = rect.Get("x").ToNumber();
            std::int32_t y = rect.Get("y").ToNumber();

            ShareMemFrameBuffer *head = (ShareMemFrameBuffer *)windowBitmapMemOrigin; // image data header
            std::int32_t oldWidth = head->width;
            std::int32_t oldX = head->x;
            std::int32_t oldHeight = head->height;
            std::int32_t oldY = head->y;

            if(width * height > it->second->maxWidth * it->second->maxHeight) {
                // need to create a larger shared memory space for this
                std::string bufferName = _shareMemoryName(windowId);
                newBufferStr = builder.CreateString(bufferName);
                newBuffer = true;
                log("Resizing shared mem from " + std::to_string(it->second->maxWidth * it->second->maxHeight) + " to " + std::to_string(width * height) + ", new buffer name: " + bufferName);

                createImageMem(windowId, bufferName, width, height);
                auto it = shareMemMap_.find(windowId);
                if (it != shareMemMap_.end())
                {
                    windowBitmapMemOrigin = static_cast<char *>(it->second->windowBitmapMem->get_address());
                    // TODO.. does the old one get released?
                    head = (ShareMemFrameBuffer *)windowBitmapMemOrigin;
                }
            }

            head->width = width;
            head->height = height;
            head->x = x;
            head->y = y;

            std::uint32_t *bitmapWriteOrigin = (std::uint32_t *)(windowBitmapMemOrigin + sizeof(ShareMemFrameBuffer));

            if(oldWidth != width) {
                // have to redraw the entire child buffer after a width change
                redrawChild = true;
            }

            Napi::Object dirtyRect = parent.Get("dirty").ToObject();
            std::int32_t dirtyWidth = dirtyRect.Get("width").ToNumber();
            std::int32_t dirtyHeight = dirtyRect.Get("height").ToNumber();
            std::int32_t dirtyX = dirtyRect.Get("x").ToNumber();
            std::int32_t dirtyY = dirtyRect.Get("y").ToNumber();

            if(dirtyWidth != 0 && dirtyHeight != 0) {
                Napi::Buffer<std::uint32_t> buffer = parent.Get("buffer").As<Napi::Buffer<std::uint32_t>>();
                const std::uint32_t *readOrigin = buffer.Data();

                Napi::Object child;
                Napi::Object childRect;
                std::int32_t childX;
                std::int32_t childY;
                std::int32_t childWidth;
                std::int32_t childHeight;

                if(hasChild) {
                    child = info[3].ToObject();
                    childRect = child.Get("rect").ToObject();
                    childX = childRect.Get("x").ToNumber();
                    childY = childRect.Get("y").ToNumber();
                    childWidth = childRect.Get("width").ToNumber();
                    childHeight = childRect.Get("height").ToNumber();
                }

                for (int row = 0; row != dirtyHeight; row++)
                {
                    std::int32_t actualRow = row + dirtyY;
                    if(hasChild && actualRow >= childY && actualRow <= (childY + childHeight)) {
                        // child window is on this row
                        // is our parent dirty rect on the left side, right side, or both sides of the child window?

                        if(dirtyX < childX) { // starts to the left of the child window
                            if(dirtyX + dirtyWidth > childX + childWidth) {
                                // drawing on both sides of the window

                                const std::uint32_t *leftReadPos = readOrigin + (actualRow * width + dirtyX);
                                std::uint32_t *leftWritePos = bitmapWriteOrigin + (actualRow * width + dirtyX);
                                std::int32_t leftWidth = childX - dirtyX;

                                const std::uint32_t *rightReadPos = readOrigin + (actualRow * width + childX + childWidth);
                                std::uint32_t *rightWritePos = bitmapWriteOrigin + (actualRow * width + childX + childWidth);
                                std::int32_t rightWidth = (dirtyX + dirtyWidth) - (childX + childWidth);

                                memcpy(leftWritePos, leftReadPos, sizeof(std::uint32_t) * leftWidth);
                                memcpy(rightWritePos, rightReadPos, sizeof(std::uint32_t) * rightWidth);
                            } else {
                                // only drawing to left of window, could partially be under child window
                                const std::uint32_t *leftReadPos = readOrigin + (actualRow * width + dirtyX);
                                std::uint32_t *leftWritePos = bitmapWriteOrigin + (actualRow * width + dirtyX);
                                std::int32_t maxWidth = childX - dirtyX;
                                std::int32_t leftWidth = std::min(maxWidth, dirtyWidth);

                                memcpy(leftWritePos, leftReadPos, sizeof(std::uint32_t) * leftWidth);
                            }
                        } else { // starting inside or to the right of the child window
                            if(dirtyX + dirtyWidth > childX + childWidth) {
                                 // drawing to the right of child window, could partially be under child window
                                 std::int32_t minX = childX + childWidth;
                                 std::int32_t startX = std::max(minX, dirtyX);

                                 const std::uint32_t *rightReadPos = readOrigin + (actualRow * width + startX);
                                 std::uint32_t *rightWritePos = bitmapWriteOrigin + (actualRow * width + startX);
                                 std::int32_t rightWidth = (dirtyX + dirtyWidth) - startX;

                                 memcpy(rightWritePos, rightReadPos, sizeof(std::uint32_t) * rightWidth);
                            } else {
                                // dirty is entirely under child window, don't do anything
                            }
                        }
                    } else {
                        // child window is not on this row, draw full row
                        const std::uint32_t *readPos = readOrigin + (actualRow * width + dirtyX);
                        std::uint32_t *writePos = bitmapWriteOrigin + (actualRow * width + dirtyX);
                        memcpy(writePos, readPos, sizeof(std::uint32_t) * dirtyWidth);
                    }
                }
            }

            if(hasChild) {
                Napi::Object child = info[3].ToObject();

                Napi::Object childDirtyRect = child.Get("dirty").ToObject();
                std::int32_t childDirtyWidth = childDirtyRect.Get("width").ToNumber();
                std::int32_t childDirtyHeight = childDirtyRect.Get("height").ToNumber();
                std::int32_t childDirtyX = childDirtyRect.Get("x").ToNumber();
                std::int32_t childDirtyY = childDirtyRect.Get("y").ToNumber();

                Napi::Object childRect = child.Get("rect").ToObject();
                std::int32_t childWidth = childRect.Get("width").ToNumber();
                std::int32_t childHeight = childRect.Get("height").ToNumber();

                if(redrawChild) {
                    childDirtyWidth = childWidth;
                    childDirtyHeight = childHeight;
                    childDirtyX = 0;
                    childDirtyY = 0;
                }

                if(childDirtyWidth != 0 && childDirtyHeight != 0) {
                    std::int32_t childX = childRect.Get("x").ToNumber();
                    std::int32_t childY = childRect.Get("y").ToNumber();

                    Napi::Buffer<std::uint32_t> buffer = child.Get("buffer").As<Napi::Buffer<std::uint32_t>>();
                    const std::uint32_t *readOrigin = buffer.Data();

                    std::int32_t maxDirtyWidth = childWidth - childDirtyX;
                    for (int row = 0; row != childDirtyHeight; row++)
                    {
                        std::int32_t readRow = childDirtyY + row;
                        std::int32_t writeRow = childY + childDirtyY + row;
                        if(writeRow <= height) {
                            const std::uint32_t *readPos = readOrigin + ((readRow * childWidth) + childDirtyX);
                            std::uint32_t *writePos = bitmapWriteOrigin + ((writeRow * width) + childX + childDirtyX);
                            memcpy(writePos, readPos, sizeof(std::uint32_t) * std::min(childDirtyWidth, maxDirtyWidth));
                        }
                    }

                }
            }
        }

        EveVision::IPC::WindowFrameBufferBuilder bufferBuilder(builder);

        bufferBuilder.add_windowId(windowId);
        if(newBuffer) {
            bufferBuilder.add_bufferName(newBufferStr);
        }
        this->_sendMessage(&builder, bufferBuilder.Finish(), EveVision::IPC::ClientMessage::WindowFrameBuffer);

        return env.Undefined();
    }

    void notifyGameProcess(std::uint32_t pid, std::string& path)
    {
        if (eventCallback_)
        {
            Napi::HandleScope scope(eventCallback_->env);
            Napi::Object object = Napi::Object::New(eventCallback_->env);
            object.Set("pid", Napi::Value::From(eventCallback_->env, pid));
            object.Set("path", Napi::Value::From(eventCallback_->env, path));
            eventCallback_->callback.MakeCallback(eventCallback_->receiver.Value(), { Napi::Value::From(eventCallback_->env, "game.process"), object });
        }
    }

    void notifyGameExit(std::uint32_t pid)
    {
        if (eventCallback_)
        {
            Napi::HandleScope scope(eventCallback_->env);
            Napi::Object object = Napi::Object::New(eventCallback_->env);
            object.Set("pid", Napi::Value::From(eventCallback_->env, pid));
            eventCallback_->callback.MakeCallback(eventCallback_->receiver.Value(), { Napi::Value::From(eventCallback_->env, "game.exit"), object });
        }
    }

    void notifyInputEvent(std::uint32_t pid, std::uint32_t windowId, std::uint32_t msg, std::uint32_t wparam, std::uint32_t lparam)
    {
        if (eventCallback_)
        {
            Napi::HandleScope scope(eventCallback_->env);
            Napi::Object object = Napi::Object::New(eventCallback_->env);
            object.Set("pid", Napi::Value::From(eventCallback_->env, pid));
            object.Set("windowId", Napi::Value::From(eventCallback_->env, windowId));
            object.Set("msg", Napi::Value::From(eventCallback_->env, msg));
            object.Set("wparam", Napi::Value::From(eventCallback_->env, wparam));
            object.Set("lparam", Napi::Value::From(eventCallback_->env, lparam));
            eventCallback_->callback.MakeCallback(eventCallback_->receiver.Value(), { Napi::Value::From(eventCallback_->env, "game.input"), object });
        }
    }

    void notifyGameWindowBoundsRequest(std::uint32_t pid, std::uint32_t windowId, int width, int height, int x, int y)
    {
        if (eventCallback_)
        {
            Napi::HandleScope scope(eventCallback_->env);
            Napi::Object object = Napi::Object::New(eventCallback_->env);
            object.Set("pid", Napi::Value::From(eventCallback_->env, pid));
            object.Set("windowId", Napi::Value::From(eventCallback_->env, windowId));
            object.Set("width", Napi::Value::From(eventCallback_->env, width));
            object.Set("height", Napi::Value::From(eventCallback_->env, height));
            object.Set("x", Napi::Value::From(eventCallback_->env, x));
            object.Set("y", Napi::Value::From(eventCallback_->env, y));
            eventCallback_->callback.MakeCallback(eventCallback_->receiver.Value(), { Napi::Value::From(eventCallback_->env, "game.window.boundsrequest"), object });
        }
    }

    void notifyGraphicsWindow(std::uint32_t pid, int width, int height, bool focused)
    {
        if (eventCallback_)
        {
            Napi::HandleScope scope(eventCallback_->env);
            Napi::Object object = Napi::Object::New(eventCallback_->env);
            object.Set("pid", Napi::Value::From(eventCallback_->env, pid));
            object.Set("width", Napi::Value::From(eventCallback_->env, width));
            object.Set("height", Napi::Value::From(eventCallback_->env, height));
            object.Set("focused", Napi::Value::From(eventCallback_->env, focused));
            eventCallback_->callback.MakeCallback(eventCallback_->receiver.Value(), { Napi::Value::From(eventCallback_->env, "graphics.window"), Napi::Value::From(eventCallback_->env, object) });
        }
    }

    void notifyGraphicsWindowResize(std::uint32_t pid, int width, int height)
    {
        if (eventCallback_)
        {
            Napi::HandleScope scope(eventCallback_->env);
            Napi::Object object = Napi::Object::New(eventCallback_->env);
            object.Set("pid", Napi::Value::From(eventCallback_->env, pid));
            object.Set("width", Napi::Value::From(eventCallback_->env, width));
            object.Set("height", Napi::Value::From(eventCallback_->env, height));
            eventCallback_->callback.MakeCallback(eventCallback_->receiver.Value(), { Napi::Value::From(eventCallback_->env, "graphics.window.event.resize"), Napi::Value::From(eventCallback_->env, object) });
        }
    }

    void notifyGraphicsWindowFocus(std::uint32_t pid, bool focused)
    {
        if (eventCallback_)
        {
            Napi::HandleScope scope(eventCallback_->env);
            Napi::Object object = Napi::Object::New(eventCallback_->env);
            object.Set("pid", Napi::Value::From(eventCallback_->env, pid));
            object.Set("focused", Napi::Value::From(eventCallback_->env, focused));
            eventCallback_->callback.MakeCallback(eventCallback_->receiver.Value(), { Napi::Value::From(eventCallback_->env, "graphics.window.event.focus"), Napi::Value::From(eventCallback_->env, object) });
        }
    }

    void notifyGameWindowFocused(std::uint32_t pid, std::uint32_t windowId)
    {
        if (eventCallback_)
        {
            Napi::HandleScope scope(eventCallback_->env);
            Napi::Object object = Napi::Object::New(eventCallback_->env);
            object.Set("pid", Napi::Value::From(eventCallback_->env, pid));
            object.Set("focusWindowId", Napi::Value::From(eventCallback_->env, windowId));
            eventCallback_->callback.MakeCallback(eventCallback_->receiver.Value(), { Napi::Value::From(eventCallback_->env, "game.window.focused"), Napi::Value::From(eventCallback_->env, object) });
        }
    }

    void notifyClearHover(std::uint32_t pid)
    {
        if (eventCallback_)
        {
            Napi::HandleScope scope(eventCallback_->env);
            Napi::Object object = Napi::Object::New(eventCallback_->env);
            object.Set("pid", Napi::Value::From(eventCallback_->env, pid));
            eventCallback_->callback.MakeCallback(eventCallback_->receiver.Value(), { Napi::Value::From(eventCallback_->env, "game.clearhover"), Napi::Value::From(eventCallback_->env, object) });
        }
    }

  private:
    void _makeCallback()
    {
        if (eventCallback_)
        {
            Napi::HandleScope scope(eventCallback_->env);
            Napi::Object object = Napi::Object::New(eventCallback_->env);
            //test
            object.Set("test", Napi::Value::From(eventCallback_->env, 123789));
            eventCallback_->callback.Call(eventCallback_->receiver.Value(), {object});
        }
    }

    template <typename T>
    void _sendMessage(flatbuffers::FlatBufferBuilder* builder, flatbuffers::Offset<T> message, EveVision::IPC::ClientMessage messageType)
    {
        auto container = EveVision::IPC::CreateClientMessageContainer(*builder, 0, 0, messageType, message.Union());
        builder->Finish(container);

        for (const auto& it : this->ipcClients_)
        {
            this->ipcHostCenter_->sendMessage(it.second, builder);
        }
    }

  private:

  void log(std::string message) {
      if (eventCallback_)
      {
          Napi::HandleScope scope(eventCallback_->env);
          Napi::Object object = Napi::Object::New(eventCallback_->env);
          object.Set("message", Napi::Value::From(eventCallback_->env, message));
          eventCallback_->callback.MakeCallback(eventCallback_->receiver.Value(), { Napi::Value::From(eventCallback_->env, "log"), object });
      }
  }

    void onClientConnect(IIpcLink *client) override
    {
        this->ipcClients_.insert(std::make_pair(client->remoteIdentity(), client));
        _sendOverlayInit(client);
        log("Overlay DLL connected");
    }

    void onClientClose(IIpcLink *client) override
    {
        this->ipcClients_.erase(client->remoteIdentity());
        std::int32_t pid = client->remoteIdentity();
        node_async_call::async_call([this, pid]() {
            notifyGameExit(pid);
        });
        log("Overlay DLL disconnected");
    }

    void onMessage(IIpcLink *link, const EveVision::IPC::GameMessageContainer* container)
    {
       switch (container->message_type())
       {
            OVERLAY_DISPATCH(GameInput);
            OVERLAY_DISPATCH(GameWindowBoundsRequest);
            OVERLAY_DISPATCH(GraphicsWindowSetup);
            OVERLAY_DISPATCH(GraphicsWindowResizeEvent);
            OVERLAY_DISPATCH(GraphicsWindowFocusEvent);
            OVERLAY_DISPATCH(GameWindowFocused);
            OVERLAY_DISPATCH(ClearHover);
        default:
            break;
       }
    }

    void _sendOverlayInit(IIpcLink *link)
    {
        log("Sending overlay init");
        flatbuffers::FlatBufferBuilder builder;

        auto init = EveVision::IPC::CreateOverlayInit(builder, builder.CreateString(shareMemMutex_));
        auto container = EveVision::IPC::CreateClientMessageContainer(builder, 0, 0, EveVision::IPC::ClientMessage::OverlayInit, init.Union());

        builder.Finish(container);
        
        this->ipcHostCenter_->sendMessage(link, &builder);
    }

    std::string _shareMemoryName(std::int32_t windowId)
    {
        static long long pid = GetCurrentProcessId();
        static long long nextImage = 0;
        long long time = GetTickCount();
        std::string name = std::string("evevision-overlay-").append(std::to_string(pid)).append("-").append(std::to_string(time)).append("-");
        name.append(std::to_string((long long)windowId)).append("-image-").append(std::to_string(++nextImage));
        return name;
    }

    void _onGameInput(std::uint32_t pid, const EveVision::IPC::GameInput* overlayMsg)
    {
        node_async_call::async_call([this, pid, overlayMsg]() {
            notifyInputEvent(pid, overlayMsg->windowId(), overlayMsg->msg(), overlayMsg->wparam(), overlayMsg->lparam());
        });
    }

    void _onGameWindowBoundsRequest(std::uint32_t pid, const EveVision::IPC::GameWindowBoundsRequest* overlayMsg)
    {
        node_async_call::async_call([this, pid, overlayMsg]() {
            notifyGameWindowBoundsRequest(pid, overlayMsg->windowId(), overlayMsg->width(), overlayMsg->height(), overlayMsg->x(), overlayMsg->y());
        });
    }

    void _onGraphicsWindowSetup(std::uint32_t pid, const EveVision::IPC::GraphicsWindowSetup* overlayMsg)
    {
        node_async_call::async_call([this, pid, overlayMsg]() {
            notifyGraphicsWindow(pid, overlayMsg->width(), overlayMsg->height(), overlayMsg->focused());
        });
    }

    void _onGraphicsWindowResizeEvent(std::uint32_t pid, const EveVision::IPC::GraphicsWindowResizeEvent* overlayMsg)
    {
        node_async_call::async_call([this, pid, overlayMsg]() {
            notifyGraphicsWindowResize(pid, overlayMsg->width(), overlayMsg->height());
        });
    }

    void _onGraphicsWindowFocusEvent(std::uint32_t pid, const EveVision::IPC::GraphicsWindowFocusEvent* overlayMsg)
    {
        node_async_call::async_call([this, pid, overlayMsg]() {
            notifyGraphicsWindowFocus(pid, overlayMsg->focused());
        });
    }

    void _onGameWindowFocused(std::uint32_t pid, const EveVision::IPC::GameWindowFocused* overlayMsg)
    {
        node_async_call::async_call([this, pid, overlayMsg]() {
            notifyGameWindowFocused(pid, overlayMsg->windowId());
        });
    }

    void _onClearHover(std::uint32_t pid, const EveVision::IPC::ClearHover* overlayMsg)
    {
        node_async_call::async_call([this, pid]() {
            notifyClearHover(pid);
        });
    }
};
