#include "stable.h"
#include "overlay.h"
#include "hookapp.h"
#include "hook/inputhook.h"
#include <regex>
#include "flatbuffers/flatbuffers.h"
#include "GameInput.h"
#include "GameMessageContainer.h"
#include "ClearHover.h"
#include "GameWindowFocused.h"
#include "GameWindowBoundsRequest.h"
#include "GameInput.h"
#include "OverlayInit.h"

static auto _syncDragResizeLeft = [&](auto& window, auto& newRect, std::int32_t xdiff, std::int32_t /*ydiff*/) {
    auto curWidth = newRect.width;
    auto curRight = newRect.width + newRect.x;

    curWidth -= xdiff;
    if (curWidth < (int)window->minWidth)
        curWidth = window->minWidth;
    else if (curWidth > (int)window->maxWidth)
        curWidth = window->maxWidth;
    newRect.x = curRight - curWidth;
    newRect.width = curWidth;
};

static auto _syncDragResizeRight = [&](auto& window, auto& newRect, std::int32_t xdiff, std::int32_t /*ydiff*/) {
    auto curWidth = newRect.width;

    curWidth += xdiff;
    if (curWidth < (int)window->minWidth)
        curWidth = window->minWidth;
    else if (curWidth > (int)window->maxWidth)
        curWidth = window->maxWidth;
    newRect.width = curWidth;
};

static auto _syncDragResizeTop = [&](auto& window, auto& newRect, std::int32_t /*xdiff*/, std::int32_t ydiff) {
    auto curHeight = newRect.height;
    auto curBottom = newRect.height + newRect.y;
    curHeight -= ydiff;
    if (curHeight < (int)window->minHeight)
        curHeight = window->minHeight;
    else if (curHeight > (int)window->maxHeight)
        curHeight = window->maxHeight;
    newRect.y = (curBottom - curHeight);
    newRect.height = curHeight;
};

static auto _syncDragResizeBottom = [&](auto& window, auto& newRect, std::int32_t /*xdiff*/, std::int32_t ydiff) {
    auto curHeight = newRect.height;
    curHeight += ydiff;
    if (curHeight < (int)window->minHeight)
        curHeight = window->minHeight;
    else if (curHeight > (int)window->maxHeight)
        curHeight = window->maxHeight;
    newRect.height = curHeight;
};

bool isInputTransparentWindow(const std::string& name)
{
    // what windows are draw-only
    return false;
}

OverlayConnector::OverlayConnector()
{
    arrowCursor_ = (HCURSOR)::LoadImageW(NULL, IDC_ARROW, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);
    ibeamCursor_ = (HCURSOR)::LoadImageW(NULL, IDC_IBEAM, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);
    handCusor_ = (HCURSOR)::LoadImageW(NULL, IDC_HAND, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);
    crossCusor_ = (HCURSOR)::LoadImageW(NULL, IDC_CROSS, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);
    waitCusor_ = (HCURSOR)::LoadImageW(NULL, IDC_WAIT, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);
    helpCusor_ = (HCURSOR)::LoadImageW(NULL, IDC_HELP, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);
    sizeAllCusor_ = (HCURSOR)::LoadImageW(NULL, IDC_SIZEALL, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);
    sizeNWSECusor_ = (HCURSOR)::LoadImageW(NULL, IDC_SIZENWSE, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);
    sizeNESWCusor_ = (HCURSOR)::LoadImageW(NULL, IDC_SIZENESW, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);
    sizeNSCusor_ = (HCURSOR)::LoadImageW(NULL, IDC_SIZENS, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);
    sizeWECusor_ = (HCURSOR)::LoadImageW(NULL, IDC_SIZEWE, IMAGE_CURSOR, 0, 0, LR_DEFAULTSIZE | LR_SHARED);

    topWindows_ = { "Main", "Status" };
}

OverlayConnector::~OverlayConnector()
{
}

void OverlayConnector::start()
{
    __trace__;

    CHECK_THREAD(Threads::HookApp);

    std::string ipcName = "evevision-overlay-client";
    ipcName.append("-");
    ipcName.append(win_utils::toLocal8Bit(HookApp::instance()->procName()));
    ipcName.append("-");
    ipcName.append(std::to_string(::GetCurrentProcessId()));
    
    __trace__ << ipcName;

    getIpcCenter()->init(ipcName);
}

void OverlayConnector::connect()
{
    std::string characterName = std::regex_replace(session::windowTitle(), std::regex("EVE - "), "");
    std::string correctedCharacterName = std::regex_replace(characterName, std::regex(" "), "-");
    std::transform(correctedCharacterName.begin(), correctedCharacterName.end(), correctedCharacterName.begin(),
        [](unsigned char c) { return std::tolower(c); });

    std::string mainIpcName = "evevision-overlay-" + correctedCharacterName;

    __trace__ << "connecting to " << mainIpcName;

    ipcLink_ = getIpcCenter()->getLink(mainIpcName);
    ipcLink_->addClient(this);
    getIpcCenter()->connectToHost(ipcLink_, "", "");
}

void OverlayConnector::quit()
{
    __trace__;
    CHECK_THREAD(Threads::HookApp);

    if (ipcLink_)
    {
        _sendGameExit();
        getIpcCenter()->closeLink(ipcLink_);
        ipcLink_ = nullptr;
    }
    getIpcCenter()->uninit();
}

void OverlayConnector::sendGraphicsWindowSetupInfo(int width, int height, bool focus)
{
    CHECK_THREAD(Threads::HookApp);

    HookApp::instance()->async([this, width, height, focus]() {
        _sendGraphicsWindowSetupInfo(width, height, focus);
    });
}

void OverlayConnector::sendGraphicsWindowResizeEvent(int width, int height)
{
    CHECK_THREAD(Threads::Window);
    HookApp::instance()->async([this, width, height]() {
        _sendGraphicsWindowResizeEvent(width, height);
    });
}

void OverlayConnector::sendGameWindowBoundsRequest(uint32_t window, int width, int height, int x, int y) {
    CHECK_THREAD(Threads::Window);

    HookApp::instance()->async([this, window, width, height, x, y]() {
        _sendGameWindowBoundsRequest(window, width, height, x, y);
    });
}

void OverlayConnector::sendGraphicsWindowFocusEvent(bool focus)
{
    CHECK_THREAD(Threads::Window);
    HookApp::instance()->async([this, focus]() {
        _sendGraphicsWindowFocusEvent(focus);
    });

    if (!focus)
    {
        clearMouseDrag();
    }

}

void OverlayConnector::sendGraphicsWindowDestroy()
{
    CHECK_THREAD(Threads::Window);
    HookApp::instance()->async([this]() {
        _sendGraphicsWindowDestroy();
    });
}

const std::vector<std::shared_ptr<WindowInfo>>& OverlayConnector::windows()
{
    return windows_;
}

void OverlayConnector::lockShareMem()
{
    shareMemoryLock_.lock();
}

void OverlayConnector::unlockShareMem()
{
    shareMemoryLock_.unlock();
}

void OverlayConnector::lockWindows()
{
    windowsLock_.lock();
}

void OverlayConnector::unlockWindows()
{
    windowsLock_.unlock();
}

bool OverlayConnector::processNCHITTEST(UINT /*message*/, WPARAM /*wParam*/, LPARAM lParam)
{
    if (dragMoveWindowId_ != 0)
    {
        return true;
    }

    POINTS screenPoint = MAKEPOINTS(lParam);
    POINT mousePointInGameClient = { screenPoint.x, screenPoint.y };
    ScreenToClient(session::graphicsWindow(), &mousePointInGameClient);

    std::lock_guard<std::mutex> lock(windowsLock_);

    for (auto it = windows_.rbegin(); it != windows_.rend(); ++it)
    {
        auto& window = *it;

        if(isInputTransparentWindow(window->name))
        {
            continue;
        }

        if (overlay_game::pointInRect(mousePointInGameClient, window->rect))
        {
            POINT mousePointinWindowClient = { mousePointInGameClient.x, mousePointInGameClient.y };
            mousePointinWindowClient.x -= window->rect.x;
            mousePointinWindowClient.y -= window->rect.y;

            std::lock_guard<std::mutex> lock(framesLock_);
            auto it = frameBuffers_.find(window->windowId);
            if (it != frameBuffers_.end())
            {
                auto& image = it->second;
                if (mousePointinWindowClient.x >= 0 && mousePointinWindowClient.x < image->width
                    && mousePointinWindowClient.y >= 0 && mousePointinWindowClient.y < image->height)
                {
                    int pix = image->data[mousePointinWindowClient.y * window->rect.width + mousePointinWindowClient.x];
                    if (pix >> 24 == 0)
                    {
                        continue;
                    }

                    //go to hitTest
                }
                else
                {
                    hitTest_ = HTNOWHERE;
                    continue;
                }
            }
            else
            {
                DAssert(false);
                __trace__ << "did not find frame buffer for windowId:" << window->windowId;

                hitTest_ = HTNOWHERE;
                return false;
            }

            hitTest_ = overlay_game::hitTest(mousePointinWindowClient, window->rect, window->resizable, window->caption, window->dragBorderWidth);
            return hitTest_ != HTNOWHERE;
        }
    }

    hitTest_ = HTNOWHERE;

    return false;
}

bool OverlayConnector::processMouseMessage(UINT message, WPARAM wParam, LPARAM lParam)
{

    std::lock_guard<std::mutex> lock(windowsLock_);
    POINT mousePointInGameClient{ LOWORD(lParam), HIWORD(lParam) };

    {
        std::lock_guard<std::recursive_mutex> lock(mouseDragLock_);
        //move by caption hittest
        if (dragMoveWindowId_ != 0) //if already dragging
        {
            auto it = std::find_if(windows_.begin(), windows_.end(), [&](const auto& window) {
                return window->windowId == dragMoveWindowId_;
            });
            if (it != windows_.end())
            {
                auto& window = *it;

                if (message == WM_MOUSEMOVE)
                {
                    POINT mousePointinWindowClient = { mousePointInGameClient.x, mousePointInGameClient.y };
                    mousePointinWindowClient.x -= dragMoveWindowStartRect_.x;
                    mousePointinWindowClient.y -= dragMoveWindowStartRect_.y;

                    int xdiff = mousePointinWindowClient.x - dragMoveMouseStartPos_.x;
                    int ydiff = mousePointinWindowClient.y - dragMoveMouseStartPos_.y;

                    WindowRect newRect = {};
                    newRect.x = dragMoveWindowStartRect_.x;
                    newRect.y = dragMoveWindowStartRect_.y;
                    newRect.width = dragMoveWindowStartRect_.width;
                    newRect.height = dragMoveWindowStartRect_.height;

                    if (dragMoveMode_ == HTCAPTION)
                    {
                        newRect.x += xdiff;
                        newRect.y += ydiff;

                        this->sendGameWindowBoundsRequest(window->windowId, newRect.width, newRect.height, newRect.x, newRect.y);
                    }
                    else
                    {
                        if (dragMoveMode_ == HTLEFT)
                        {
                            _syncDragResizeLeft(window, newRect, xdiff, ydiff);
                        }
                        else if (dragMoveMode_ == HTRIGHT)
                        {
                            _syncDragResizeRight(window, newRect, xdiff, ydiff);
                        }
                        else if (dragMoveMode_ == HTTOP)
                        {
                            _syncDragResizeTop(window, newRect, xdiff, ydiff);
                        }
                        else if (dragMoveMode_ == HTBOTTOM)
                        {
                            _syncDragResizeBottom(window, newRect, xdiff, ydiff);
                        }
                        else if (dragMoveMode_ == HTTOPLEFT)
                        {
                            _syncDragResizeLeft(window, newRect, xdiff, ydiff);
                            _syncDragResizeTop(window, newRect, xdiff, ydiff);
                        }
                        else if (dragMoveMode_ == HTTOPRIGHT)
                        {
                            _syncDragResizeRight(window, newRect, xdiff, ydiff);
                            _syncDragResizeTop(window, newRect, xdiff, ydiff);
                        }
                        else if (dragMoveMode_ == HTBOTTOMLEFT)
                        {
                            _syncDragResizeLeft(window, newRect, xdiff, ydiff);
                            _syncDragResizeBottom(window, newRect, xdiff, ydiff);
                        }
                        else if (dragMoveMode_ == HTBOTTOMRIGHT)
                        {
                            _syncDragResizeRight(window, newRect, xdiff, ydiff);
                            _syncDragResizeBottom(window, newRect, xdiff, ydiff);
                        }

                        this->sendGameWindowBoundsRequest(window->windowId, newRect.width, newRect.height, newRect.x, newRect.y);
                        
                    }
                    return true;
                }
                else if (message == WM_LBUTTONUP)
                {
                    clearMouseDrag();
                }
            }
            else
            {
                clearMouseDrag();
            }
            return true;
        }
    }

    if (message == WM_MOUSEWHEEL)
    {
        POINT gx = { 0, 0 };
        ClientToScreen(session::graphicsWindow(), &gx);

        mousePointInGameClient.x -= (SHORT)gx.x;
        mousePointInGameClient.y -= (SHORT)gx.y;
    }

    if (mousePressWindowId_)
    {
        auto it = std::find_if(windows_.begin(), windows_.end(), [&](const auto& window) {
            return window->windowId == mousePressWindowId_;
        });

        if (it != windows_.end())
        {
            auto& window = *it;

            POINT mousePointinWindowClient = { mousePointInGameClient.x, mousePointInGameClient.y };
            mousePointinWindowClient.x -= window->rect.x;
            mousePointinWindowClient.y -= window->rect.y;

            DWORD pos = mousePointinWindowClient.x + (mousePointinWindowClient.y << 16);
            lParam = (LPARAM)pos;

            HookApp::instance()->async([this, windowId = window->windowId, message, wParam, lParam]() {
                _sendGameWindowInput(windowId, message, wParam, lParam);
            });

            if (message == WM_LBUTTONUP)
            {
                mousePressWindowId_ = 0;
            }
        }
        else
        {
            mousePressWindowId_ = 0;
        }

        return true;
    }

    for (auto it = windows_.rbegin(); it != windows_.rend(); ++it)
    {
        auto& window = *it;

        if (isInputTransparentWindow(window->name))
        {
            continue;
        }

        if (overlay_game::pointInRect(mousePointInGameClient, window->rect))
        {
            POINT mousePointinWindowClient = { mousePointInGameClient.x, mousePointInGameClient.y };
            mousePointinWindowClient.x -= window->rect.x;
            mousePointinWindowClient.y -= window->rect.y;

            // alpha test
            std::lock_guard<std::mutex> lock(framesLock_);
            auto it = frameBuffers_.find(window->windowId);
            if (it != frameBuffers_.end())
            {
                auto& image = it->second;
                if (mousePointinWindowClient.x >= 0 && mousePointinWindowClient.x < image->width
                    && mousePointinWindowClient.y >= 0 && mousePointinWindowClient.y < image->height)
                {
                    int pix = image->data[mousePointinWindowClient.y * window->rect.width + mousePointinWindowClient.x];
                    if (pix >> 24 == 0)
                    {
                        continue;
                    }
                    //goto normal handling
                }
                else
                {
                    continue;
                }
            }
            else
            {
                DAssert(false);
                __trace__ << "did not find frame buffer for windowId:" << window->windowId;

                continue;
            }

            //even for mousewheel we translate it to local cord

            DWORD pos = mousePointinWindowClient.x + (mousePointinWindowClient.y << 16);
            lParam = (LPARAM)pos;

            if (message == WM_LBUTTONDOWN)
            {
                mousePressWindowId_ = window->windowId;
                focusWindowId_ = window->windowId;
                focusWindow_ = window->nativeHandle;

                _syncFocusWindowChanged();

                if (hitTest_ == HTCAPTION)
                {
                    std::lock_guard<std::recursive_mutex> lock(mouseDragLock_);
                    dragMoveWindowId_ = window->windowId;
                    dragMoveWindowHandle_ = window->nativeHandle;
                    dragMoveMouseStartPos_.x = mousePointinWindowClient.x;
                    dragMoveMouseStartPos_.y = mousePointinWindowClient.y;
                    dragMoveWindowStartRect_.x = window->rect.x;
                    dragMoveWindowStartRect_.y = window->rect.y;
                    dragMoveWindowStartRect_.width = window->rect.width;
                    dragMoveWindowStartRect_.height = window->rect.height;
                    dragMoveMode_ = HTCAPTION;
                    std::cout << "starting caption drag at " << dragMoveMouseStartPos_.x << "," << dragMoveMouseStartPos_.y << " window rect " << dragMoveWindowStartRect_.x << "," << dragMoveWindowStartRect_.y << " " << dragMoveWindowStartRect_.width << "x" << dragMoveWindowStartRect_.height << std::endl;

                }
                else if(hitTest_ != HTCLIENT)
                {
                    std::lock_guard<std::recursive_mutex> lock(mouseDragLock_);
                    dragMoveWindowId_ = window->windowId;
                    dragMoveWindowHandle_ = window->nativeHandle;
                    dragMoveMouseStartPos_.x = mousePointinWindowClient.x;
                    dragMoveMouseStartPos_.y = mousePointinWindowClient.y;
                    dragMoveWindowStartRect_.x = window->rect.x;
                    dragMoveWindowStartRect_.y = window->rect.y;
                    dragMoveWindowStartRect_.width = window->rect.width;
                    dragMoveWindowStartRect_.height = window->rect.height;
                    dragMoveMode_ = hitTest_;
                    std::cout << "starting edge drag at " << dragMoveMouseStartPos_.x << "," << dragMoveMouseStartPos_.y << " window rect " << dragMoveWindowStartRect_.x << "," << dragMoveWindowStartRect_.y << " " << dragMoveWindowStartRect_.width << "x" << dragMoveWindowStartRect_.height << std::endl;
                }
            }
            else if (message == WM_LBUTTONUP)
            {
                mousePressWindowId_ = 0;
            }


            if (dragMoveWindowId_ == 0)
            {
                HookApp::instance()->async([this, windowId = window->windowId, message, wParam, lParam]() {
                    _sendGameWindowInput(windowId, message, wParam, lParam);
                });
            }

            if (focusWindowId_)
            {
                if (windows_.at(windows_.size() -1)->windowId != focusWindowId_)
                {
                    auto it = std::find_if(windows_.begin(), windows_.end(), [&](auto w) {
                        return w->windowId == focusWindowId_;
                    });

                    auto focusWindow = *it;
                    windows_.erase(it);
                    windows_.push_back(focusWindow);

                    _ensureTopWindows();

                    this->windowFocusEvent()(focusWindowId_);
                }

            }

            return true;
        }
    }

    if (message == WM_LBUTTONDOWN)
    {
        focusWindowId_ = 0;
        focusWindow_ = 0;

        _syncFocusWindowChanged();
    }

    return false;
}

bool OverlayConnector::processkeyboardMessage(UINT message, WPARAM wParam, LPARAM lParam)
{
    if (focusWindowId_ != 0)
    {
        HookApp::instance()->async([this, windowId = focusWindowId_.load(), message, wParam, lParam]() {
            _sendGameWindowInput(windowId, message, wParam, lParam);
        });
        return true;
    }
    else
    {
        return false;
    }
}

void OverlayConnector::clearFocus() {
  //__trace__;
  focusWindowId_ = 0;
  focusWindow_ = 0;

  _syncFocusWindowChanged();
}

void OverlayConnector::clearHover() {
  _sendClearHover();
}

bool OverlayConnector::processSetCursor()
{
    if (hitTest_ == HTCAPTION)
    {
        Windows::OrginalApi::SetCursor(arrowCursor_);
        return true;
    }

    if (hitTest_ == HTLEFT || hitTest_ == HTRIGHT)
    {
        Windows::OrginalApi::SetCursor(sizeWECusor_);
        return true;
    }

    if (hitTest_ == HTTOP || hitTest_ == HTBOTTOM)
    {
        Windows::OrginalApi::SetCursor(sizeNSCusor_);
        return true;
    }

    if (hitTest_ == HTTOPLEFT || hitTest_ == HTBOTTOMRIGHT)
    {
        Windows::OrginalApi::SetCursor(sizeNWSECusor_);
        return true;
    }

    if (hitTest_ == HTTOPRIGHT || hitTest_ == HTBOTTOMLEFT)
    {
        Windows::OrginalApi::SetCursor(sizeNESWCusor_);
        return true;
    }

    if(cursorShape_ == overlay_game::Cursor::ARROW)
    {
        Windows::OrginalApi::SetCursor(arrowCursor_);
        return true;
    }
    else if (cursorShape_ == overlay_game::Cursor::IBEAM)
    {
        Windows::OrginalApi::SetCursor(ibeamCursor_);
        return true;
    }
    else if (cursorShape_ == overlay_game::Cursor::HAND )
    {
        Windows::OrginalApi::SetCursor(handCusor_);
        return true;
    }
    else if (cursorShape_ == overlay_game::Cursor::CROSS)
    {
        Windows::OrginalApi::SetCursor(crossCusor_);
        return true;
    }
    else if (cursorShape_ == overlay_game::Cursor::WAIT)
    {
        Windows::OrginalApi::SetCursor(waitCusor_);
        return true;
    }
    else if (cursorShape_ == overlay_game::Cursor::HELP)
    {
        Windows::OrginalApi::SetCursor(helpCusor_);
        return true;
    }
    else if (cursorShape_ == overlay_game::Cursor::SIZEALL)
    {
        Windows::OrginalApi::SetCursor(sizeAllCusor_);
        return true;
    }
    else if (cursorShape_ == overlay_game::Cursor::SIZENWSE)
    {
        Windows::OrginalApi::SetCursor(sizeNWSECusor_);
        return true;
    }
    else if (cursorShape_ == overlay_game::Cursor::SIZENESW)
    {
        Windows::OrginalApi::SetCursor(sizeNESWCusor_);
        return true;
    }
    else if (cursorShape_ == overlay_game::Cursor::SIZENS)
    {
        Windows::OrginalApi::SetCursor(sizeNSCusor_);
        return true;
    }
    else if (cursorShape_ == overlay_game::Cursor::SIZEWE)
    {
        Windows::OrginalApi::SetCursor(sizeWECusor_);
        return true;
    }
    else
    {
        Windows::OrginalApi::SetCursor(arrowCursor_);
        return true;
    }
}

void OverlayConnector::clearMouseDrag()
{
    std::lock_guard<std::recursive_mutex> lock(mouseDragLock_);
    mousePressWindowId_ = 0;
    dragMoveWindowId_ = 0;
    dragMoveWindowHandle_ = 0;
    dragMoveMode_ = HTNOWHERE;
    dragMoveMouseStartPos_ = { 0 };
    dragMoveWindowStartRect_ = {};
    hitTest_ = HTNOWHERE;
}

void OverlayConnector::_syncFocusWindowChanged()
{
    //__trace__ << focusWindowId_;
    HookApp::instance()->async([this]() {
        _sendInGameWindowFocused(focusWindowId_);
    });
}

void OverlayConnector::_ensureTopWindows()
{
    //in lock

    std::for_each(topWindows_.begin(), topWindows_.end(), [this](const std::string& name) {
        auto it = std::find_if(windows_.begin(), windows_.end(), [&](const auto &window) {
            return name == window->name;
        });
        if (it != windows_.end())
        {
            auto window = *it;
            windows_.erase(it);
            windows_.push_back(window);
        }
    });
}

void OverlayConnector::_sendGameExit()
{
    flatbuffers::FlatBufferBuilder builder;
    _sendMessage(&builder, EveVision::IPC::CreateGameExit(builder), EveVision::IPC::GameMessage::GameExit);
}

void OverlayConnector::_sendGraphicsWindowSetupInfo(int width, int height, bool focus)
{
    flatbuffers::FlatBufferBuilder builder;
    _sendMessage(&builder, EveVision::IPC::CreateGraphicsWindowSetup(builder, width, height, focus), EveVision::IPC::GameMessage::GraphicsWindowSetup);
}

void OverlayConnector::_sendGameWindowInput(std::uint32_t windowId, UINT msg, WPARAM wparam, LPARAM lparam)
{
    flatbuffers::FlatBufferBuilder builder;
    _sendMessage(&builder, EveVision::IPC::CreateGameInput(builder, windowId, msg, wparam, lparam), EveVision::IPC::GameMessage::GameInput);
}

void OverlayConnector::_sendGameWindowBoundsRequest(std::uint32_t windowId, int width, int height, int x, int y)
{
    flatbuffers::FlatBufferBuilder builder;
    _sendMessage(&builder, EveVision::IPC::CreateGameWindowBoundsRequest(builder, windowId, width, height, x, y), EveVision::IPC::GameMessage::GameWindowBoundsRequest);
}

void OverlayConnector::_sendGraphicsWindowResizeEvent(int width, int height)
{
    flatbuffers::FlatBufferBuilder builder;
    _sendMessage(&builder, EveVision::IPC::CreateGraphicsWindowResizeEvent(builder, width, height), EveVision::IPC::GameMessage::GraphicsWindowResizeEvent);
}

void OverlayConnector::_sendGraphicsWindowFocusEvent(bool focus)
{
    flatbuffers::FlatBufferBuilder builder;
    _sendMessage(&builder, EveVision::IPC::CreateGraphicsWindowFocusEvent(builder, focus), EveVision::IPC::GameMessage::GraphicsWindowFocusEvent);
}

void OverlayConnector::_sendGraphicsWindowDestroy()
{
    flatbuffers::FlatBufferBuilder builder;
    _sendMessage(&builder, EveVision::IPC::CreateGraphicsWindowDestroyEvent(builder), EveVision::IPC::GameMessage::GraphicsWindowDestroyEvent);
}

void OverlayConnector::_sendInGameWindowFocused(std::uint32_t windowId)
{
    flatbuffers::FlatBufferBuilder builder;
    _sendMessage(&builder, EveVision::IPC::CreateGameWindowFocused(builder, windowId), EveVision::IPC::GameMessage::GameWindowFocused);
}

void OverlayConnector::_sendClearHover()
{

    //__trace__ << focusWindowId_;
    HookApp::instance()->async([this]() {
        flatbuffers::FlatBufferBuilder builder;
        _sendMessage(&builder, EveVision::IPC::CreateClearHover(builder), EveVision::IPC::GameMessage::ClearHover);
    });
    
}

template <typename T>
void OverlayConnector::_sendMessage(flatbuffers::FlatBufferBuilder* builder, flatbuffers::Offset<T> message, EveVision::IPC::GameMessage messageType)
{
    auto container = EveVision::IPC::CreateGameMessageContainer(*builder, ipcClientId_, 0, messageType, message.Union());
    builder->Finish(container);
    if (ipcLink_)
    {
        getIpcCenter()->sendMessage(ipcLink_, builder);
    }
}

void OverlayConnector::_onRemoteConnect()
{
    session::setOverlayConnected(true);

    this->remoteConnectEvent()();
}

void OverlayConnector::_onRemoteClose()
{
    {
        std::lock_guard<std::mutex> lock(windowsLock_);
        windows_.clear();
    }
    {
        std::lock_guard<std::mutex> lock(framesLock_);
        frameBuffers_.clear();
    }

    shareMemoryLock_.close();

    clearMouseDrag();

    focusWindowId_ = 0;
    focusWindow_ = 0;

    session::setOverlayEnabled(false);
    session::setOverlayConnected(false);

    HookApp::instance()->async([this]() {
        if (!HookApp::instance()->isQuitSet())
        {
            connect();
        }
    });
}

void OverlayConnector::onLinkConnect(IIpcLink *)
{
    __trace__;

    _onRemoteConnect();
}

void OverlayConnector::onLinkClose(IIpcLink *)
{
    __trace__;

    ipcLink_ = nullptr;

    _onRemoteClose();
}

void OverlayConnector::onMessage(IIpcLink *, const EveVision::IPC::ClientMessageContainer* container)
{

#define OVERLAY_DISPATCH(type) \
case EveVision::IPC::ClientMessage::##type:\
{\
    _on##type(container->message_as_##type()); \
    break; \
}\

    switch (container->message_type())
    {
        OVERLAY_DISPATCH(OverlayInit);
        OVERLAY_DISPATCH(WindowInfo);
        OVERLAY_DISPATCH(WindowFrameBuffer);
        OVERLAY_DISPATCH(WindowPosition);
        OVERLAY_DISPATCH(WindowClose);
        OVERLAY_DISPATCH(CursorCommand);
    default:
        __trace__ << "message didn't match any dispatch";
        break;
    }
}

void OverlayConnector::saveClientId(IIpcLink*, int clientId)
{
    __trace__;
    ipcClientId_ = clientId;
}

void OverlayConnector::_onOverlayInit(const EveVision::IPC::OverlayInit* overlayMsg)
{
    session::setOverlayEnabled(true);

    HookApp::instance()->startHook();

    shareMemoryLock_.open(win_utils::fromUtf8(overlayMsg->shareMemMutex()->c_str()));

}

void OverlayConnector::_onWindowInfo(const EveVision::IPC::WindowInfo* overlayMsg)
{

    {
        std::lock_guard<std::mutex> lock(windowsLock_);
        WindowInfo info = {};
        info.bufferName = overlayMsg->bufferName()->str();

        info.dragBorderWidth = overlayMsg->dragBorderWidth();
        info.maxHeight = overlayMsg->maxHeight();
        info.minHeight = overlayMsg->minHeight();
        info.maxWidth = overlayMsg->maxWidth();
        info.minWidth = overlayMsg->minWidth();
        info.name = overlayMsg->name()->str();
        info.nativeHandle = overlayMsg->nativeHandle();
        info.resizable = overlayMsg->resizable();
        info.windowId = overlayMsg->windowId();

        info.rect = {};
        info.rect.x = overlayMsg->rect()->x();
        info.rect.y = overlayMsg->rect()->y();
        info.rect.width = overlayMsg->rect()->width();
        info.rect.height = overlayMsg->rect()->height();

        info.caption = {};
        info.caption.top = overlayMsg->caption()->top();
        info.caption.left = overlayMsg->caption()->left();
        info.caption.right = overlayMsg->caption()->right();
        info.caption.height = overlayMsg->caption()->height();

        std::shared_ptr<WindowInfo> infoPtr = std::make_shared<WindowInfo>(info);

        _updateFrameBuffer(infoPtr, overlayMsg->bufferName()->c_str(), false);

        windows_.emplace_back(infoPtr);

        focusWindowId_ = overlayMsg->windowId();
        focusWindow_ = overlayMsg->nativeHandle();

        _syncFocusWindowChanged();

        _ensureTopWindows();

    }

    this->windowEvent()(overlayMsg->windowId());

    this->windowFocusEvent()(focusWindowId_);
}

void OverlayConnector::_onWindowPosition(const EveVision::IPC::WindowPosition* overlayMsg)
{
    std::lock_guard<std::mutex> lock(windowsLock_);
    auto it = std::find_if(windows_.begin(), windows_.end(), [&](auto window) {
        return overlayMsg->windowId() == window->windowId;
    });

    if (it != windows_.end())
    {
        auto& window = *it;

        window->rect.x = overlayMsg->x();
        window->rect.y = overlayMsg->y();

        // only thing this event needs to do is set the x/y on the sprite
        WindowPosition pos = {};
        pos.windowId = overlayMsg->windowId();
        pos.x = overlayMsg->x();
        pos.y = overlayMsg->y();

        this->windowPositionEvent()(pos);
    }
}

void OverlayConnector::_onWindowClose(const EveVision::IPC::WindowClose* overlayMsg)
{
    std::lock_guard<std::mutex> lock(windowsLock_);
    auto it = std::find_if(windows_.begin(), windows_.end(), [&](const auto &window) {
        return overlayMsg->windowId() == window->windowId;
    });

    if (it != windows_.end())
    {
        std::lock_guard<std::mutex> lock(framesLock_);
        frameBuffers_.erase((*it)->windowId);
        windows_.erase(it);

        if (focusWindowId_ == overlayMsg->windowId())
        {
            focusWindowId_ = 0;
            focusWindow_ = 0;
            this->windowFocusEvent()(0);

            _syncFocusWindowChanged();
        }

        this->windowCloseEvent()(overlayMsg->windowId());

        {
            std::lock_guard<std::recursive_mutex> lock(mouseDragLock_);
            if (overlayMsg->windowId() == dragMoveWindowId_)
            {
                clearMouseDrag();
            }
        }
    }
}

void OverlayConnector::_onWindowFrameBuffer(const EveVision::IPC::WindowFrameBuffer* overlayMsg)
{
    std::lock_guard<std::mutex> lock(windowsLock_);

    auto it = std::find_if(windows_.begin(), windows_.end(), [&](const auto& window) {
        return overlayMsg->windowId() == window->windowId;
        });

    if (it != windows_.end())
    {
        auto& window = *it;

        if (overlayMsg->bufferName() != nullptr) // node module is telling us to change buffer, likely due to a size change
        {
            window->bufferName = overlayMsg->bufferName()->str();

            _updateFrameBuffer(window, window->bufferName, true); // update the mouse hit test frame buffer

            this->frameBufferUpdateEvent()(window->windowId); // this signals to change buffers, will occur in same tick
            this->frameBufferEvent()(window->windowId);
        }
        else {
            _updateFrameBuffer(window, window->bufferName, true);  // update the mouse hit test frame buffer
            this->frameBufferEvent()(window->windowId);
        }

    }
}

// copy the frame buffer into our own separate frame buffer array used for mouse hit tests.
void OverlayConnector::_updateFrameBuffer(const std::shared_ptr<WindowInfo>& info, const std::string &bufferName, bool updateWindowSize)
{
    try
    {
        windows_shared_memory share_mem(windows_shared_memory::open_only, bufferName.c_str(), windows_shared_memory::read_only);

        Storm::ScopedLock lockShareMem(shareMemoryLock_);

        char *origin = static_cast<char *>(share_mem.get_address());
        ShareMemFrameBuffer *header = (ShareMemFrameBuffer *)origin;
        int *mem = (int *)(origin + sizeof(ShareMemFrameBuffer));

        // copy the frame buffer out of the shared memory space and into ours
        std::shared_ptr<overlay_game::FrameBuffer> frameBuffer(new overlay_game::FrameBuffer(header->width, header->height, mem));

        if (updateWindowSize) {
            // make sure windows are locked!
            info->rect.width = header->width;
            info->rect.height = header->height;
            info->rect.x = header->x;
            info->rect.y = header->y;
        }

        std::lock_guard<std::mutex> lock(framesLock_);
        frameBuffers_[info->windowId] = frameBuffer;

        //__trace__ << "window: " << windowId << ", width:" << head->width << ", height:" << head->height;
    }
    catch (std::exception& e)
    {
        __trace__ << ", error:" << e.what();
    }
}

void OverlayConnector::_onCursorCommand(const EveVision::IPC::CursorCommand* overlayMsg)
{
    static std::map<std::string, overlay_game::Cursor> cursorMap = {
        { "IDC_ARROW", overlay_game::Cursor::ARROW },
        { "IDC_IBEAM", overlay_game::Cursor::IBEAM },
        { "IDC_HAND", overlay_game::Cursor::HAND },
        { "IDC_CROSS", overlay_game::Cursor::CROSS },
        { "IDC_WAIT", overlay_game::Cursor::WAIT },
        { "IDC_HELP", overlay_game::Cursor::HELP },
        { "IDC_SIZEALL", overlay_game::Cursor::SIZEALL},
        { "IDC_SIZENWSE", overlay_game::Cursor::SIZENWSE },
        { "IDC_SIZENESW", overlay_game::Cursor::SIZENESW },
        { "IDC_SIZENS", overlay_game::Cursor::SIZENS },
        { "IDC_SIZEWE", overlay_game::Cursor::SIZEWE },
    };
    cursorShape_ = cursorMap[overlayMsg->cursor()->c_str()];
}