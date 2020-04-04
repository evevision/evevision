#pragma once
#include "./ipc/ipclink.h"
#include "session.h"
#include "flatbuffers/flatbuffers.h"
#include "GameMessageContainer.h"
#include "WindowInfo.h"
#include "WindowPosition.h"
#include "WindowClose.h"
#include "CursorCommand.h"
#include "WindowFrameBuffer.h"
#include "OverlayInit.h"
#include <atomic>

class OverlayConnector : public IIpcClient
{

    int ipcClientId_ = 0;
    IIpcLink *ipcLink_ = nullptr;

    Storm::Mutex shareMemoryLock_;

    std::mutex windowsLock_;
    std::vector<std::shared_ptr<WindowInfo>> windows_;
    std::atomic<std::uint32_t> focusWindowId_ = 0;
    std::atomic<std::uint32_t> focusWindow_ = 0;

    std::mutex framesLock_;
    std::map<std::uint32_t, std::shared_ptr<overlay_game::FrameBuffer>> frameBuffers_;

    Storm::Event<void()> remoteConnectEvent_;

    Storm::Event<void(std::uint32_t)> windowEvent_;
    Storm::Event<void(std::uint32_t)> frameBufferEvent_;
    Storm::Event<void(std::uint32_t)> windowCloseEvent_;
    Storm::Event<void(WindowPosition)> windowPositionEvent_;
    Storm::Event<void(std::uint32_t)> frameBufferUpdateEvent_;
    Storm::Event<void(std::uint32_t)> windowFocusEvent_;

    std::wstring mainProcessDir_;

    std::atomic<std::uint32_t> mousePressWindowId_ = 0;

    std::recursive_mutex mouseDragLock_;
    std::atomic<std::uint32_t> dragMoveWindowId_ = 0;
    std::uint32_t dragMoveWindowHandle_ = 0;
    POINT dragMoveMouseStartPos_ = {0};
    WindowRect dragMoveWindowStartRect_ = { };
    std::uint32_t dragMoveMode_ = HTNOWHERE;

    std::int32_t hitTest_ = HTNOWHERE;
    std::atomic<overlay_game::Cursor> cursorShape_ = overlay_game::Cursor::ARROW;

    HCURSOR arrowCursor_ = nullptr ;
    HCURSOR ibeamCursor_ = nullptr;
    HCURSOR handCusor_ = nullptr;
    HCURSOR crossCusor_ = nullptr;
    HCURSOR waitCusor_ = nullptr;
    HCURSOR helpCusor_ = nullptr;
    HCURSOR sizeAllCusor_ = nullptr;
    HCURSOR sizeNWSECusor_ = nullptr;
    HCURSOR sizeNESWCusor_ = nullptr;
    HCURSOR sizeNSCusor_ = nullptr;
    HCURSOR sizeWECusor_ = nullptr;

    std::vector<std::string> topWindows_;

public:
    OverlayConnector();
    ~OverlayConnector();

    void start();
    void connect();
    void quit();

    void sendGraphicsWindowSetupInfo(int width, int height, bool focus);
    void sendGraphicsWindowResizeEvent(int width, int height);
    void sendGraphicsWindowFocusEvent(bool focus);
    void sendGraphicsWindowDestroy();
    void sendGameWindowBoundsRequest(std::uint32_t windowId, int width, int height, int x, int y);

    const std::vector<std::shared_ptr<WindowInfo>>& windows();

    Storm::Event<void()>& remoteConnectEvent() { return remoteConnectEvent_; }
    Storm::Event<void(std::uint32_t)>& windowEvent() { return windowEvent_; }
    Storm::Event<void(std::uint32_t)>& frameBufferEvent() { return frameBufferEvent_; }
    Storm::Event<void(std::uint32_t)>& windowCloseEvent() { return windowCloseEvent_; }
    Storm::Event<void(std::uint32_t)>& frameBufferUpdateEvent() { return frameBufferUpdateEvent_; }
    Storm::Event<void(std::uint32_t)>& windowFocusEvent() { return windowFocusEvent_; }
    Storm::Event<void(WindowPosition)>& windowPositionEvent() { return windowPositionEvent_; }

    std::wstring mainProcessDir() const { return mainProcessDir_; }
    std::wstring d3dcompiler47Path() const { return L""; }

    std::int32_t hitTestResult()  const { return hitTest_; }
    std::uint32_t focusWindowId() const { return focusWindowId_; }
    bool isMousePressingOnOverlayWindow() const { return mousePressWindowId_ != 0; }

    void lockShareMem();
    void unlockShareMem();

    void lockWindows();
    void unlockWindows();

    bool processNCHITTEST(UINT message, WPARAM wParam, LPARAM lParam);
    bool processMouseMessage(UINT message, WPARAM wParam, LPARAM lParam);

    void clearFocus();
    void clearHover();

    bool processkeyboardMessage(UINT message, WPARAM wParam, LPARAM lParam);

    bool processSetCursor();

    void clearMouseDrag();


protected:
    void _syncFocusWindowChanged();
    void _ensureTopWindows();

    void _sendGameExit();

    void _sendGraphicsWindowSetupInfo(int width, int height, bool focus);

    void _sendGameWindowInput(std::uint32_t windowId, UINT message, WPARAM wParam, LPARAM lParam);

    void _sendGraphicsWindowResizeEvent(int width, int height);
    void _sendGraphicsWindowFocusEvent(bool focus);
    void _sendGraphicsWindowDestroy();

    void _sendGameWindowBoundsRequest(std::uint32_t windowId, int width, int height, int x, int y);

    void _sendInGameWindowFocused(std::uint32_t windowId);
    void _sendClearHover();

    template <typename T>
    void _sendMessage(flatbuffers::FlatBufferBuilder* builder, flatbuffers::Offset<T> message, EveVision::IPC::GameMessage messageType);

private:
    void _onRemoteConnect();
    void _onRemoteClose();

private:
    void onLinkConnect(IIpcLink *) override;
    void onLinkClose(IIpcLink *) override;
    void onMessage(IIpcLink *, const EveVision::IPC::ClientMessageContainer* container) override;
    void saveClientId(IIpcLink *, int clientId) override;

private:
    void _onOverlayInit(const EveVision::IPC::OverlayInit* overlayMsg);
    void _onWindowInfo(const EveVision::IPC::WindowInfo* overlayMsg);
    void _onWindowFrameBuffer(const EveVision::IPC::WindowFrameBuffer* overlayMsg);
    void _onWindowClose(const EveVision::IPC::WindowClose* overlayMsg);
    void _onWindowPosition(const EveVision::IPC::WindowPosition* overlayMsg);

    void _updateFrameBuffer(const std::shared_ptr<WindowInfo>& info, const std::string& bufferName, bool updateSize);

    void _onCursorCommand(const EveVision::IPC::CursorCommand* overlayMsg);
};
