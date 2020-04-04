#include "ipclink.h"
#include "flatbuffers/flatbuffers.h"
#include <iostream>

IpcLink::IpcLink(const std::string& hostName)
: m_hostName(hostName)
, m_remoteIpcWindow(NULL)
, m_remoteProcess(NULL)
, m_status(Closed)
{

}

IpcLink::~IpcLink(void)
{

}

bool IpcLink::sendMessage(flatbuffers::FlatBufferBuilder* message)
{
    COPYDATASTRUCT copydatast;
    memset(&copydatast, 0, sizeof(copydatast));
    copydatast.dwData = GetCurrentProcessId();
    copydatast.cbData = (DWORD)message->GetSize();
    copydatast.lpData = (PVOID)message->GetBufferPointer();

    if (status() == IIpcLink::Connected)
    {
        return (0 != ::SendMessage(m_remoteIpcWindow, WM_COPYDATA, NULL, (LPARAM)&copydatast));
    }
    else
    {
        m_pendingOutQueue.push_back(message);
        return true;
    }
}


void IpcLink::addClient(IIpcClient* client)
{
    static int clientId = 0;
    clientId += 1;
    client->saveClientId(this, clientId);
    m_clients[clientId] = client;
}

void IpcLink::removeClient(IIpcClient* client)
{
    for(std::map<int, IIpcClient*>::iterator it = m_clients.begin(); it != m_clients.end(); ++it)
    {
        if (it->second == client)
        {
            m_clients.erase(it);
            break;
        }
    }
}

void IpcLink::onConnecting()
{
    m_status = IIpcLink::Connecting;
}

void IpcLink::onConnect()
{
    m_status = IIpcLink::Connected;

    for (std::map<int, IIpcClient*>::iterator it = m_clients.begin(); it != m_clients.end();)
    {
        auto itNext = it;
        ++itNext;
        it->second->onLinkConnect(this);
        it = itNext;
    }

    for (auto it = m_pendingOutQueue.begin(); it != m_pendingOutQueue.end(); it++)
    {
        COPYDATASTRUCT copydatast;
        memset(&copydatast, 0, sizeof(copydatast));
        copydatast.dwData = GetCurrentProcessId();
        copydatast.cbData = (DWORD)(**it).GetSize();
        copydatast.lpData = (PVOID)(**it).GetBufferPointer();

        ::SendMessage(m_remoteIpcWindow, WM_COPYDATA, NULL, (LPARAM)&copydatast);
    }
    m_pendingOutQueue.clear();
}

void IpcLink::onClosed()
{
    m_status = IIpcLink::Closed;
    for(std::map<int, IIpcClient*>::iterator it = m_clients.begin(); it != m_clients.end();)
    {
        auto itNext = it;
        ++itNext;
        it->second->onLinkClose(this);
        it = itNext;
    }
    m_clients.clear();

    if (m_remoteProcess)
    {
        ::CloseHandle(m_remoteProcess);
    }
    m_remoteProcess = NULL;
    m_remoteIpcWindow = NULL;

    delete this;
}

void IpcLink::onMessage(const EveVision::IPC::GameMessageContainer* container)
{
    if (container->clientId() == 0)
    {
        for(std::map<int, IIpcClient*>::iterator it = m_clients.begin(); it != m_clients.end(); )
        {
            auto itNext = it;
            ++itNext;
            it->second->onMessage(this, container);
            it = itNext;
        }
    }
    else
    {
        for(std::map<int, IIpcClient*>::iterator it = m_clients.begin(); it != m_clients.end(); ++it)
        {
            if (it->first == container->clientId())
            {
                it->second->onMessage(this, container);
                break;
            }
        }
    }
}

