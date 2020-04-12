#pragma once

#include "GameMessageContainer.h"

struct IIpcLink;

struct IIpcClient
{
    virtual ~IIpcClient() { ; }
    virtual void onLinkClose(IIpcLink *) = 0;
    virtual void onLinkConnect(IIpcLink *) = 0;
    virtual void onMessage(IIpcLink *, const EveVision::IPC::GameMessageContainer* container) = 0;
    virtual void saveClientId(IIpcLink *, int clientId) = 0;
};

struct IIpcLink
{
    enum Status
    {
        Closed,
        Connecting,
        Connected
    };

    virtual ~IIpcLink() { ; }
    virtual void addClient(IIpcClient *client) = 0;
    virtual void removeClient(IIpcClient *client) = 0;
    virtual bool isConnect() const = 0;
    virtual std::uint32_t remoteIdentity() const = 0;
    virtual std::string clientName() const = 0;
    virtual Status status() const = 0;
};

struct IIpcHost
{
    virtual ~IIpcHost() { ; }
    virtual void onClientConnect(IIpcLink *) = 0;
    virtual void onClientClose(IIpcLink *) = 0;
    virtual void onMessage(IIpcLink *link, const EveVision::IPC::GameMessageContainer* container) = 0;
};

struct IIpcHostCenter
{
    virtual ~IIpcHostCenter() { ; }
    virtual void init(const std::string &hostName, IIpcHost *) = 0;
    virtual void uninit() = 0;
    virtual bool sendMessage(IIpcLink *, flatbuffers::FlatBufferBuilder* message) = 0;
};

IIpcHostCenter *createIpcHostCenter();
void destroyIpcHostCenter(IIpcHostCenter *);