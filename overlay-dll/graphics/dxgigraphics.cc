#include "stable.h"
#include "overlay/hookapp.h"
#include "overlay/session.h"
#include "dxgigraphics.h"

bool DxgiGraphics::isWindowed() const
{
    return windowed_;
}

bool DxgiGraphics::initGraphics(IDXGISwapChain *swap)
{

    std::cout << "initializing graphics" << std::endl;

    bool succeed = _initGraphicsContext(swap) && _initGraphicsState();

    if (succeed)
    {
        std::cout << "successfully initialized" << std::endl;
        _initSpriteDrawer();
        _createSprites();
        _createWindowSprites();
    }

    if (!succeed)
    {
        std::cout << "failed to init, freeing" << std::endl;
        freeGraphics();
    }

    if (succeed)
    {
        HookApp::instance()->overlayConnector()->windowEvent().add([this](std::uint32_t windowId) {
            std::lock_guard<std::mutex> lock(synclock_);
            syncState_.pendingWindows_.insert(windowId);
            needResync_ = true;
        }, this);

        HookApp::instance()->overlayConnector()->frameBufferEvent().add([this](std::uint32_t windowId) {
            std::lock_guard<std::mutex> lock(synclock_);
            syncState_.pendingFrameBuffers_.insert(windowId);
            needResync_ = true;
        }, this);

        HookApp::instance()->overlayConnector()->windowCloseEvent().add([this](std::uint32_t windowId) {
            std::lock_guard<std::mutex> lock(synclock_);
            syncState_.pendingClosed_.insert(windowId);
            needResync_ = true;
        }, this);

        HookApp::instance()->overlayConnector()->windowPositionEvent().add([this](WindowPosition position) {
            std::lock_guard<std::mutex> lock(synclock_);
            syncState_.pendingPosition_.emplace_back(position);
            needResync_ = true;
            }, this);

        HookApp::instance()->overlayConnector()->frameBufferUpdateEvent().add([this](std::uint32_t windowId) {
            std::lock_guard<std::mutex> lock(synclock_);
            syncState_.pendingFrameBufferUpdates_.insert(windowId);
            needResync_ = true;
        }, this);

        HookApp::instance()->overlayConnector()->windowFocusEvent().add([this](std::uint32_t windowId) {
            std::lock_guard<std::mutex> lock(synclock_);
            syncState_.focusWindowId_ = windowId;
            needResync_ = true;
        }, this);

        std::cout << "graphics init success" << std::endl;
    }

    return succeed;
}

void DxgiGraphics::uninitGraphics(IDXGISwapChain *swap)
{
    if (swapChain().get() != swap)
    {
        return;
    }

    freeGraphics();
}

void DxgiGraphics::freeGraphics()
{

    std::cout << "freeing graphics" << std::endl;

    HookApp::instance()->overlayConnector()->windowEvent().remove(this);
    HookApp::instance()->overlayConnector()->frameBufferEvent().remove(this);
    HookApp::instance()->overlayConnector()->windowCloseEvent().remove(this);
    HookApp::instance()->overlayConnector()->windowPositionEvent().remove(this);
    HookApp::instance()->overlayConnector()->frameBufferUpdateEvent().remove(this);
    HookApp::instance()->overlayConnector()->windowFocusEvent().remove(this);
    /*
    std::lock_guard<std::mutex> lock(synclock_);
    syncState_.pendingWindows_.clear();
    syncState_.pendingFrameBuffers_.clear();
    syncState_.pendingPosition_.clear();
    syncState_.pendingClosed_.clear();
    syncState_.pendingFrameBufferUpdates_.clear();
    syncState_.focusWindowId_ = 0;
    needResync_ = false;
    */
    std::cout << "graphics freed" << std::endl;
}

void DxgiGraphics::beforePresent(IDXGISwapChain *swap)
{
    if (swapChain().get() != swap)
    {
        return;
    }

    session::setGraphicsThreadId(GetCurrentThreadId());

    _saveStatus();
    _prepareStatus();

    _checkAndResyncWindows();

    _drawWindowSprites();
    _restoreStatus();
}

void DxgiGraphics::afterPresent(IDXGISwapChain *swap)
{
    if (swapChain().get() != swap)
    {
        return;
    }
}
