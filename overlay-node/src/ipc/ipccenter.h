#pragma once
#include <set>
#include <mutex>

#include "tinyipc.h"
#include "ipclink.h"

#define WM_IPC_MSG WM_APP+0x200
#define WM_IPC_CONNECTLINK WM_IPC_MSG+1  //client->host, {ipcwindow, 0}
#define WM_IPC_CONNECTLINKACK WM_IPC_CONNECTLINK+1 //host->client, {processId, 0}
#define WM_IPC_CLOSELINK WM_IPC_CONNECTLINKACK+1 // {processId, 0}, no response
#define WM_IPC_LINKLOST WM_IPC_CLOSELINK+1 //moniter, {retmoteHandle, 0}

class IpcHostCenter : public IIpcHostCenter
{
public:
    IpcHostCenter();
    virtual ~IpcHostCenter();

    virtual void init(const std::string& hostName, IIpcHost*);
    virtual void uninit();
    virtual bool sendMessage(IIpcLink* , flatbuffers::FlatBufferBuilder* message);

private:   
    void _startIpcThread();
    void _closeIpcThread();
    bool _addClient(HWND window);
    void _removeClient( unsigned int processId);
    void _linkLost(HANDLE remoteProcess);

    static LRESULT CALLBACK ipcLogicProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam );
    LRESULT _ipcLogicProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam );

    static LRESULT CALLBACK ipcWindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam );
    LRESULT _ipcWindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam );

    static unsigned int __stdcall ipcThreadProc(void*);
    unsigned int _ipcThreadProc();

private:
    IIpcHost* m_host;
    std::string m_hostName;

    std::mutex m_linkLock;
    std::map<std::string, IpcLink*> m_links;

    HWND m_ipcLogicWnd;
    HWND m_ipcWindow;
    HANDLE m_ipcThread;
    HANDLE m_ipcThreadEvent;

    std::mutex m_remoteHandleLock;
    HANDLE m_waitingHandles[64];
    int m_waitingCount;
};