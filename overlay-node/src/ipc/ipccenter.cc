#include <process.h>
#include <memory>
#include <assert.h>
#include "IpcCenter.h"
#include "IpcLink.h"
#include "utils.hpp"
#include "flatbuffers/flatbuffers.h"
#include "GameMessageContainer.h"
#include <iostream>

struct IpcContainer {
    const EveVision::IPC::GameMessageContainer* gameMessage;
};

IIpcHostCenter* createIpcHostCenter()
{
    IIpcHostCenter* hostCenter = new IpcHostCenter();
    return hostCenter;
}

void destroyIpcHostCenter(IIpcHostCenter* hostCenter)
{
    delete hostCenter;
}

IpcHostCenter::IpcHostCenter()
: m_host(NULL)
, m_ipcLogicWnd(NULL)
, m_ipcWindow(NULL)
, m_ipcThread(NULL)
, m_ipcThreadEvent(NULL)
, m_waitingCount(0)
{
    memset(m_waitingHandles, 0, sizeof(m_waitingHandles));
}

IpcHostCenter::~IpcHostCenter()
{
    uninit();
}

void IpcHostCenter::init(const std::string& hostName, IIpcHost* host)
{
    m_host = host;
    m_hostName = hostName;
    m_ipcLogicWnd = ::CreateWindowA("STATIC","IpcLogic", WS_POPUP,0,0,0,0,HWND_MESSAGE,NULL,NULL,NULL);
    ::SetWindowLongPtr(m_ipcLogicWnd, GWLP_USERDATA, (LONG_PTR)this);
    ::SetWindowLongPtr(m_ipcLogicWnd, GWLP_WNDPROC, (LONG_PTR)IpcHostCenter::ipcLogicProc);

    _startIpcThread();
}

void IpcHostCenter::uninit()
{
    _closeIpcThread();

    DestroyWindow(m_ipcLogicWnd);
    m_ipcLogicWnd = NULL;
    DWORD process = GetCurrentProcessId();
    for(std::map<std::string, IpcLink*>::iterator it = m_links.begin(); it != m_links.end(); ++it)
    {
        IpcLink* link = it->second;
        if (link->isConnect())
        {
            ::PostMessage(link->remoteWindow(), WM_IPC_CLOSELINK, (WPARAM)process, 0);
            m_host->onClientClose(link);
            link->onClosed();
        }
    }

    m_links.clear();

    memset(m_waitingHandles, 0, sizeof(m_waitingHandles));
    m_waitingCount = 0;
}

bool IpcHostCenter::sendMessage(IIpcLink* l, flatbuffers::FlatBufferBuilder* message)
{
    IpcLink* link = static_cast<IpcLink*>(l);
    return link->sendMessage(message);
}

void IpcHostCenter::_startIpcThread()
{
    m_ipcThreadEvent = CreateEvent(NULL, TRUE, FALSE, NULL);
    m_ipcThread = (HANDLE)_beginthreadex(NULL,0,&IpcHostCenter::ipcThreadProc,(void*)this,0,NULL);
    WaitForSingleObject(m_ipcThreadEvent, INFINITE);
    CloseHandle(m_ipcThreadEvent);
    m_ipcThreadEvent = NULL;
}

void IpcHostCenter::_closeIpcThread()
{
    if (IsWindow(m_ipcWindow))
    {
        PostMessage(m_ipcWindow, WM_CLOSE, 0, 0);
    }

    if (m_ipcThread)
    {
        WaitForSingleObject(m_ipcThread,INFINITE);
        CloseHandle(m_ipcThread);
    }
    m_ipcWindow = NULL;
    m_ipcThread = NULL;
}

bool IpcHostCenter::_addClient(HWND window)
{
    DWORD processId = 0;
    ::GetWindowThreadProcessId(window, &processId);
    HANDLE processHandle = ::OpenProcess(SYNCHRONIZE, FALSE, processId);
    if (processHandle == NULL)
    {
        return false;
    }

    for(std::map<std::string, IpcLink*>::iterator it = m_links.begin(); it != m_links.end(); ++it)
    {
        if (it->second->remoteWindow() == window)
        {
            assert(it->second->remoteIdentity() == processId);
            return true;
        }
    }

    CHAR clientName[MAX_PATH] = {0};
    GetWindowTextA(window, clientName, MAX_PATH);

    IpcLink* link = new IpcLink(m_hostName);
    link->setRemoteIdentity(processId);
    link->setRemoteHandle(processHandle);
    link->setRemoteWindow(window);
    link->setClientName(clientName);
    link->onConnect();

    {
        std::lock_guard<std::mutex> lock(m_remoteHandleLock);
        m_waitingHandles[m_waitingCount++] = link->remoteHandle();
        PostMessage(m_ipcWindow, WM_NULL, 0, 0);
    }
    {
        char text[512] = { 0 };
        GetWindowTextA(window, text, 512);
        std::lock_guard<std::mutex> lock(m_linkLock);
        m_links.insert(std::make_pair(std::string(text), link));
    }
    m_host->onClientConnect(link);
    return true;
}

void IpcHostCenter::_removeClient(unsigned int processId)
{
    HANDLE processHandle = NULL;
    std::lock_guard<std::mutex> lock(m_linkLock);
    for(std::map<std::string, IpcLink*>::iterator it = m_links.begin(); it != m_links.end(); ++it)
    {
        if (it->second->remoteIdentity() == processId)
        {
            processHandle = it->second->remoteHandle();
            m_host->onClientClose(it->second);
            it->second->onClosed();
            m_links.erase(it);
            break;
        }
    }

    if (processHandle)
    {
        std::lock_guard<std::mutex> lock(m_remoteHandleLock);
        int index = m_waitingCount;
        for (int i = 0; i < m_waitingCount; ++i)
        {
            if (m_waitingHandles[i] == processHandle)
            {
                index = i;
            }
        }
        if (index < m_waitingCount)
        {
            for (int i = index; i < m_waitingCount - 1; ++i)
            {
                m_waitingHandles[i] = m_waitingHandles[i + 1];
            }
            m_waitingHandles[--m_waitingCount] = 0;
        }

        PostMessage(m_ipcWindow, WM_NULL, 0, 0);
    }
}

void IpcHostCenter::_linkLost(HANDLE remoteProcess)
{
    std::lock_guard<std::mutex> lock(m_linkLock);

    for(std::map<std::string, IpcLink*>::iterator it = m_links.begin(); it != m_links.end(); ++it)
    {
        if (it->second->remoteHandle() == remoteProcess)
        {
            m_host->onClientClose(it->second);

            it->second->onClosed();
            m_links.erase(it);
            break;
        }
    }
}

LRESULT CALLBACK IpcHostCenter::ipcLogicProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    IpcHostCenter *pThis = (IpcHostCenter*)GetWindowLongPtr(hwnd, GWLP_USERDATA);
    return pThis != NULL ? pThis->_ipcLogicProc(hwnd, uMsg, wParam, lParam) : DefWindowProc(hwnd, uMsg, wParam, lParam);
}

LRESULT IpcHostCenter::_ipcLogicProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    switch(uMsg)
    {
    case WM_IPC_MSG:
        {
            std::unique_ptr<IpcContainer> ipcContainer((IpcContainer*)lParam);
            DWORD processId = (DWORD)wParam;
            {
                std::lock_guard<std::mutex> lock(m_linkLock);
                for (std::map<std::string, IpcLink*>::iterator it = m_links.begin(); it != m_links.end(); ++it)
                {
                    if (it->second->remoteIdentity() == processId)
                    {
                        m_host->onMessage(it->second, ipcContainer->gameMessage);
                        break;
                    }
                }
            }
        }
        break;
    case WM_IPC_CONNECTLINK:
        {
            HWND retmoeWindow = (HWND)wParam;
            if(_addClient(retmoeWindow))
            {
                ::PostMessage(retmoeWindow, WM_IPC_CONNECTLINKACK, GetCurrentProcessId(), 0);
            }
        }
        break;
    case WM_IPC_CLOSELINK:
        {
            unsigned int processId = (unsigned int)wParam;
            _removeClient(processId);
        }
        break;
    case WM_IPC_LINKLOST:
        {
            HANDLE remoteProcess = (HANDLE)wParam;
            _linkLost(remoteProcess);
        }
    }
    return ::DefWindowProc(hwnd, uMsg, wParam, lParam);
}

LRESULT CALLBACK IpcHostCenter::ipcWindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    IpcHostCenter *pThis = (IpcHostCenter*)GetWindowLongPtr(hwnd, GWLP_USERDATA);
    return pThis != NULL ? pThis->_ipcWindowProc(hwnd, uMsg, wParam, lParam) : DefWindowProc(hwnd, uMsg, wParam, lParam);
}

LRESULT IpcHostCenter::_ipcWindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    switch(uMsg)
    {
    case WM_COPYDATA:
        {
            COPYDATASTRUCT* data = (COPYDATASTRUCT*)lParam;
            bool ok = EveVision::IPC::VerifyGameMessageContainerBuffer(flatbuffers::Verifier((uint8_t*)data->lpData, (size_t)data->cbData));

            if (ok) {

                // need to copy
                void* buf = (void*)malloc(data->cbData);
                memcpy(buf, data->lpData, data->cbData);

                const EveVision::IPC::GameMessageContainer* gameMessage = EveVision::IPC::GetGameMessageContainer(buf);
                IpcContainer* ipcContainer = new IpcContainer;
                ipcContainer->gameMessage = gameMessage;

                ::PostMessage(m_ipcLogicWnd, WM_IPC_MSG, data->dwData, (LPARAM)ipcContainer);
                return TRUE;
            }
            else {
                std::cout << "Game message invalid!" << std::endl;
                return FALSE;
            }
        }
        break;
    case WM_IPC_CONNECTLINK:
        ::PostMessage(m_ipcLogicWnd, uMsg, wParam, lParam);
        break;
    case WM_IPC_CLOSELINK:
        ::PostMessage(m_ipcLogicWnd, uMsg, wParam, lParam);
        break;
    case WM_DESTROY:
        ::PostQuitMessage(0);
        break;
    }
    return ::DefWindowProc(hwnd, uMsg, wParam, lParam);
}

unsigned int __stdcall IpcHostCenter::ipcThreadProc(void* a)
{
    IpcHostCenter* ipcHostCenter = (IpcHostCenter*)a;
    return ipcHostCenter->_ipcThreadProc();
}

unsigned int IpcHostCenter::_ipcThreadProc()
{
    m_ipcWindow = ::CreateWindowA("STATIC", m_hostName.c_str(), WS_POPUP, 0,0,0,0, HWND_MESSAGE, NULL,NULL,NULL);

    ::SetWindowLongPtr(m_ipcWindow, GWLP_USERDATA, (LONG_PTR)this);
    ::SetWindowLongPtr(m_ipcWindow, GWLP_WNDPROC, (LONG_PTR)IpcHostCenter::ipcWindowProc);

    win_utils::customizeUIPIPolicy(m_ipcWindow, WM_COPYDATA, true);
    win_utils::customizeUIPIPolicy(m_ipcWindow, WM_IPC_CONNECTLINK, true);
    win_utils::customizeUIPIPolicy(m_ipcWindow, WM_IPC_CONNECTLINKACK, true);
    win_utils::customizeUIPIPolicy(m_ipcWindow, WM_IPC_CLOSELINK, true);

    bool running = true;
    SetEvent(m_ipcThreadEvent);

    while(running)
    {
        HANDLE waitingHandles[64] = {0};
        DWORD waitingCount = 0;
        {
            std::lock_guard<std::mutex> lock(m_remoteHandleLock);
            memcpy(waitingHandles, m_waitingHandles, sizeof(waitingHandles));
            waitingCount = m_waitingCount;
        }

        DWORD wait = MsgWaitForMultipleObjectsEx(waitingCount, waitingHandles, INFINITE, QS_ALLINPUT, 0);
        if (wait == WAIT_OBJECT_0 + waitingCount)
        {
            MSG msg;
            while(PeekMessage(&msg, NULL, 0, 0, PM_REMOVE))
            {
                if (msg.message == WM_QUIT)
                {
                    running = false;
                    break;
                }
                ::TranslateMessage(&msg);
                ::DispatchMessage(&msg);
            }
        }
        else if(wait >= WAIT_OBJECT_0 && wait < WAIT_OBJECT_0 + waitingCount)
        {
            int index = wait - WAIT_OBJECT_0;
            HANDLE processHandle = waitingHandles[index];
            ::PostMessage(m_ipcLogicWnd, WM_IPC_LINKLOST, (WPARAM)processHandle, 0);
            std::lock_guard<std::mutex> lock(m_remoteHandleLock);
            index = m_waitingCount;
            for (int i = 0; i < m_waitingCount; ++i)
            {
                if (m_waitingHandles[i] = processHandle)
                {
                    index = i;
                }
            }
            if (index < m_waitingCount)
            {
                for (int i = index; i < m_waitingCount - 1; ++i)
                {
                    m_waitingHandles[i] = m_waitingHandles[i+1];
                }
                m_waitingHandles[--m_waitingCount] = 0;
            }
        }
        else
        {
            assert(false && "_ipcThreadProc wait error!");
        }
    }

    return 0;
}
