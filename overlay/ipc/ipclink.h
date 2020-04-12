#pragma once

#include "tinyipc.h"

#include <Windows.h>
#include <map>
#include <deque>
#include "flatbuffers/flatbuffers.h"
#include "ClientMessageContainer.h"

class IpcLink : public IIpcLink
{
public:
    explicit IpcLink(const std::string& hostName);
    virtual ~IpcLink();

    virtual void addClient(IIpcClient* client) ;
    virtual void removeClient(IIpcClient* client);
    virtual bool isConnect() const { return m_status == Connected; }
    virtual std::uint32_t remoteIdentity() const { return m_remotePid;};
    virtual std::string clientName() const {return m_clientName;}
    virtual Status status()const  { return m_status; }

    const std::string& hostName() const {return m_hostName; };

    bool sendMessage(flatbuffers::FlatBufferBuilder* message);

    void setHostPath(const std::string& hostPath) { m_hostPath = hostPath; }
    void setCmdline(const std::string& cmd) { m_cmdline = cmd; }
    void setRemoteHandle(HANDLE process){ m_remoteProcess = process;}
    void setRemoteIdentity(unsigned int id) { m_remotePid = id;}
    void setRemoteWindow(HWND window) { m_remoteIpcWindow = window; }
    void setClientName(const std::string& clientName) { m_clientName = clientName;}

    void onConnecting();
    void onConnect();
    void onClosed();
    void onMessage(const EveVision::IPC::ClientMessageContainer* container);

    const std::string& localName() const { return m_clientName; }
    const std::string& remotePath() const { return m_hostPath; }
    const std::string& cmdline() const { return m_cmdline; }
    HWND remoteWindow() const { return m_remoteIpcWindow;}
    HANDLE remoteHandle() const { return m_remoteProcess; }

public:
    std::string m_clientName;
    std::string m_hostName;
    std::string m_hostPath;
    std::string m_cmdline;
    HWND m_remoteIpcWindow;
    HANDLE m_remoteProcess;
    unsigned int m_remotePid;
    std::map<int, IIpcClient*> m_clients;
    Status m_status;
};

