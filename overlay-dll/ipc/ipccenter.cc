#include <process.h>
#include <memory>
#include <assert.h>
#include "IpcCenter.h"
#include "IpcLink.h"
#include "flatbuffers/flatbuffers.h"
#include "ClientMessageContainer.h"

struct IpcContainer {
    const EveVision::IPC::ClientMessageContainer* clientMessage;
};

IIpcCenter* getIpcCenter()
{
    static IpcCenter instance;
    return &instance;
}

IIpcCenter* createIpcCenter()
{
    IIpcCenter* ipcCenter = new IpcCenter();
    return ipcCenter;
}

void destroyIpcCenter(IIpcCenter* ipcCenter)
{
    delete ipcCenter;
}

IpcCenter::IpcCenter(void)
: m_ipcLogicWnd(NULL)
, m_ipcWindow(NULL)
, m_ipcThread(NULL)
, m_ipcThreadEvent(NULL)
, m_waitingCount(0)
{
    memset(m_waitingHandles, 0, sizeof(m_waitingHandles));
}


IpcCenter::~IpcCenter(void)
{
    uninit();
}

void IpcCenter::init(const std::string& name)
{
    m_clientName = name;
    m_ipcLogicWnd = ::CreateWindowA("STATIC","IpcLogic", WS_POPUP,0,0,0,0,HWND_MESSAGE,NULL,NULL,NULL);
    ::SetWindowLongPtr(m_ipcLogicWnd, GWLP_USERDATA, (LONG_PTR)this);
    ::SetWindowLongPtr(m_ipcLogicWnd, GWLP_WNDPROC, (LONG_PTR)IpcCenter::ipcLogicProc);

    _startIpcThread();
}

void IpcCenter::uninit()
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
            link->onClosed();
        }
    }
    m_newLinks.clear();
    m_links.clear();

    memset(m_waitingHandles, 0, sizeof(m_waitingHandles));
    m_waitingCount = 0;
}

IIpcLink* IpcCenter::getLink(const std::string& hostName)
{
    std::map<std::string, IpcLink*>::iterator it = m_links.find(hostName);
    if (it != m_links.end())
    {
        return it->second;
    }

    IpcLink* newLink = new IpcLink( hostName);
    newLink->setClientName(m_clientName);
    m_links.insert(std::make_pair(hostName, newLink));
    m_newLinks.insert(newLink);
    return newLink;
}

bool IpcCenter::connectToHost(IIpcLink* l, const std::string& hostPath, const std::string& cmdline, bool createProcess /*= false*/)
{
    IpcLink* link = static_cast<IpcLink*>(l);
    if (link->status() != IpcLink::Closed)
    {
        return true;
    }

    if (createProcess)
    {
        link->setHostPath(hostPath);
        link->setCmdline(cmdline);
        std::string remoteName = link->hostName();

        char buf[1024] = {0};
        sprintf_s(buf, "\"%s\" %s ", hostPath.c_str(), cmdline.c_str());

        STARTUPINFOA info = {0};
        info.cb = sizeof(STARTUPINFOA);
        PROCESS_INFORMATION pinfo = {0};
        if (::CreateProcessA(NULL, buf, NULL, NULL, FALSE, 0, NULL, NULL, &info, &pinfo))
        {
            CloseHandle(pinfo.hProcess);
            CloseHandle(pinfo.hThread);

            ::SetTimer(m_ipcLogicWnd, 0, 500, NULL );
            return true;
        }
        return false;
    }
    else
    {
        bool r = _connectToHost(link);
        if (!r)
        {
            ::SetTimer(m_ipcLogicWnd, 0, 1000, NULL );
        }

        return r;
    }
}

bool IpcCenter::closeLink(IIpcLink* l)
{
    IpcLink* link = static_cast<IpcLink*>(l);

    ::PostMessage(link->remoteWindow(), WM_IPC_CLOSELINK, (WPARAM)GetCurrentProcessId(), 0);

    HANDLE processHandle = link->remoteHandle();
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
            m_waitingHandles[i] = m_waitingHandles[i+1];
        }
        m_waitingHandles[--m_waitingCount] = 0;
    }

    std::map<std::string, IpcLink*>::iterator it = m_links.find(link->hostName());
    m_links.erase(it);
    m_newLinks.erase(link);
    link->onClosed();

    return true;
}

bool IpcCenter::sendMessage(IIpcLink* l, flatbuffers::FlatBufferBuilder* message)
{
    IpcLink* link = static_cast<IpcLink*>(l);
    return link->sendMessage(message);
}

bool IpcCenter::_connectToHost(IpcLink* link)
{
    if (link->status() != IpcLink::Closed)
    {
        return true;
    }

    std::string remoteName = link->hostName();

    HWND window = ::FindWindowA("STATIC", remoteName.c_str());
    if (window == NULL)
    {
        return false;
    }

    DWORD processId = 0;
    ::GetWindowThreadProcessId(window, &processId);
    HANDLE processHandle = ::OpenProcess(SYNCHRONIZE, FALSE, processId);
    if (processHandle == NULL)
    {
        return false;
    }
    link->setRemoteIdentity(processId);
    link->setRemoteHandle(processHandle);
    link->setRemoteWindow(window);

    {
        std::lock_guard<std::mutex> lock(m_remoteHandleLock);
        m_waitingHandles[m_waitingCount++] = link->remoteHandle();
        PostMessage(m_ipcWindow, WM_NULL, 0, 0);
    }
    link->onConnecting();
    ::PostMessage(window, WM_IPC_CONNECTLINK, (WPARAM)m_ipcWindow, 0);
    return true;
}

void IpcCenter::_startIpcThread()
{
    m_ipcThreadEvent = CreateEvent(NULL, TRUE, FALSE, NULL);
    m_ipcThread = (HANDLE)_beginthreadex(NULL,0,&IpcCenter::ipcThreadProc,(void*)this,0,NULL);
    WaitForSingleObject(m_ipcThreadEvent, INFINITE);
    CloseHandle(m_ipcThreadEvent);
    m_ipcThreadEvent = NULL;
}

void IpcCenter::_closeIpcThread()
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

void IpcCenter::_removeLink(unsigned int processId)
{
    for(std::map<std::string, IpcLink*>::iterator it = m_links.begin(); it != m_links.end(); ++it)
    {
        if (it->second->remoteIdentity() == processId)
        {
            m_newLinks.erase(it->second);

            {
                HANDLE processHandle = it->second->remoteHandle();
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
                        m_waitingHandles[i] = m_waitingHandles[i+1];
                    }
                    m_waitingHandles[--m_waitingCount] = 0;
                }

                PostMessage(m_ipcWindow, WM_NULL, 0, 0);
            }
            it->second->onClosed();
            m_links.erase(it);
            break;
        }
    }
}

void IpcCenter::_linkLost(HANDLE process)
{
    for(std::map<std::string, IpcLink*>::iterator it = m_links.begin(); it != m_links.end(); ++it)
    {
        if (it->second->remoteHandle() == process)
        {
            m_newLinks.erase(it->second);

            it->second->onClosed();
            m_links.erase(it);
            break;
        }
    }
}


LRESULT CALLBACK IpcCenter::ipcLogicProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    IpcCenter *pThis = (IpcCenter*)GetWindowLongPtr(hwnd, GWLP_USERDATA);
    return pThis != NULL ? pThis->_ipcLogicProc(hwnd, uMsg, wParam, lParam) : DefWindowProc(hwnd, uMsg, wParam, lParam);
}

LRESULT IpcCenter::_ipcLogicProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    switch(uMsg)
    {
    case WM_TIMER:
        {
            if (m_newLinks.empty())
            {
                ::KillTimer(hwnd, wParam);
            }
            for (std::set<IpcLink*>::iterator it = m_newLinks.begin(); it != m_newLinks.end(); ++it)
            {
                _connectToHost(*it);
            }
        }
        break;
    case WM_IPC_MSG:
        {
            std::unique_ptr<IpcContainer> ipcContainer((IpcContainer*)lParam);

            DWORD processId = (DWORD)wParam;
            for(std::map<std::string, IpcLink*>::iterator it = m_links.begin(); it != m_links.end(); ++it)
            {
                if (it->second->remoteIdentity() == processId)
                {
                    it->second->onMessage(ipcContainer->clientMessage);
                    break;
                }
            }
        }
        break;
    case WM_IPC_CONNECTLINKACK:
        {
            DWORD processId = (DWORD)wParam;
            for (std::set<IpcLink*>::iterator it = m_newLinks.begin(); it != m_newLinks.end();)
            {
                if ((*it)->remoteIdentity() == processId)
                {
                    (*it)->onConnect();
                    m_newLinks.erase(it);
                    break;
                }
            }
        }
        break;
    case WM_IPC_CLOSELINK:
        {
            unsigned int processId = (unsigned int)wParam;
            _removeLink(processId);
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

LRESULT CALLBACK IpcCenter::ipcWindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    IpcCenter *pThis = (IpcCenter*)GetWindowLongPtr(hwnd, GWLP_USERDATA);
    return pThis != NULL ? pThis->_ipcWindowProc(hwnd, uMsg, wParam, lParam) : DefWindowProc(hwnd, uMsg, wParam, lParam);
}

LRESULT IpcCenter::_ipcWindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    switch(uMsg)
    {
    case WM_COPYDATA:
        {
            COPYDATASTRUCT* data = (COPYDATASTRUCT*)lParam;

            bool ok = EveVision::IPC::VerifyClientMessageContainerBuffer(flatbuffers::Verifier((uint8_t*)data->lpData, (size_t)data->cbData));

            
            if (ok) {
                // need to copy 
                void* buf = (void*)malloc(data->cbData);
                memcpy(buf, data->lpData, data->cbData);

                const EveVision::IPC::ClientMessageContainer* clientMessage = EveVision::IPC::GetClientMessageContainer(buf);
                IpcContainer* ipcContainer = new IpcContainer;
                ipcContainer->clientMessage = clientMessage;

                ::PostMessage(m_ipcLogicWnd, WM_IPC_MSG, data->dwData, (LPARAM)ipcContainer);
                return TRUE;
            }
            else {
                std::cout << "Client message invalid!" << std::endl;
                return FALSE;
            }

        }
        break;
    case WM_IPC_CONNECTLINKACK:
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

unsigned int __stdcall IpcCenter::ipcThreadProc(void* a)
{
    IpcCenter* ipcCenter = (IpcCenter*)a;
    return ipcCenter->_ipcThreadProc();
}

unsigned int IpcCenter::_ipcThreadProc()
{
    m_ipcWindow = ::CreateWindowA("STATIC", m_clientName.c_str(), WS_POPUP, 0,0,0,0, HWND_MESSAGE, NULL,NULL,NULL);

    ::SetWindowLongPtr(m_ipcWindow, GWLP_USERDATA, (LONG_PTR)this);
    ::SetWindowLongPtr(m_ipcWindow, GWLP_WNDPROC, (LONG_PTR)IpcCenter::ipcWindowProc);

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
        DWORD wait = MsgWaitForMultipleObjectsEx(waitingCount, waitingHandles, INFINITE, QS_ALLINPUT, 0 );
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