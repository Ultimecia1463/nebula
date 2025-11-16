# Socket.IO Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEXT.JS SERVER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │   App Router     │         │   Pages API      │             │
│  │   (REST API)     │────────▶│  Socket.IO       │             │
│  │                  │  Emit   │   Server         │             │
│  │  POST /messages  │  Event  │                  │             │
│  └──────────────────┘         └──────────────────┘             │
│         │                              │                         │
│         │ Save to DB                   │ Broadcast               │
│         ▼                              ▼                         │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │   PostgreSQL     │         │  Channel Rooms   │             │
│  │   (Prisma)       │         │  (Socket.IO)     │             │
│  └──────────────────┘         └──────────────────┘             │
│                                         │                         │
└─────────────────────────────────────────┼─────────────────────────┘
                                          │
                           WebSocket      │
                           Connection     │
                                          │
         ┌────────────────────────────────┼────────────────────────────┐
         │                                │                            │
         │                                ▼                            │
┌────────▼─────────┐              ┌──────────────┐          ┌────────▼─────────┐
│   CLIENT 1       │              │   CLIENT 2   │          │   CLIENT N       │
├──────────────────┤              ├──────────────┤          ├──────────────────┤
│ SocketProvider   │              │SocketProvider│          │ SocketProvider   │
│       │          │              │      │       │          │       │          │
│       ▼          │              │      ▼       │          │       ▼          │
│   useChat Hook   │              │  useChat Hook│          │   useChat Hook   │
│       │          │              │      │       │          │       │          │
│       ▼          │              │      ▼       │          │       ▼          │
│  MessageList     │              │ MessageList  │          │  MessageList     │
└──────────────────┘              └──────────────┘          └──────────────────┘
```

## 📨 Message Flow

### Sending a Message

```
User Types Message
        │
        ▼
┌──────────────────────┐
│  MessageInput.tsx    │
│  - Captures input    │
│  - Validates content │
└──────────────────────┘
        │
        ▼ HTTP POST
┌──────────────────────┐
│  REST API Route      │
│  /api/servers/.../   │
│       messages       │
│                      │
│  1. Authenticate     │
│  2. Validate         │
│  3. Save to DB       │
└──────────────────────┘
        │
        ▼ Fetch
┌──────────────────────┐
│  Socket.IO Endpoint  │
│  /api/socket/        │
│      messages        │
│                      │
│  Emit to channel     │
└──────────────────────┘
        │
        ▼ WebSocket
┌──────────────────────┐
│  Socket.IO Server    │
│  - Find channel room │
│  - Broadcast message │
└──────────────────────┘
        │
        ├─────────────┬─────────────┐
        ▼             ▼             ▼
    Client 1      Client 2      Client N
```

### Receiving a Message

```
Socket.IO Server Broadcasts
        │
        ▼ WebSocket Event
┌──────────────────────┐
│  SocketProvider      │
│  - Receives event    │
│  - Passes to context │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  useChat Hook        │
│  - Listens for event │
│  - Updates state     │
│  - Prevents dupes    │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  MessageList         │
│  - Re-renders        │
│  - Shows new message │
└──────────────────────┘
        │
        ▼
    User Sees Message
```

## 🏠 Room Management

### Joining a Channel

```
User Opens Channel
        │
        ▼
┌──────────────────────┐
│  ChannelClient.tsx   │
│  - Mounts component  │
│  - Calls useChat     │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  useChat Hook        │
│  - Gets channelId    │
│  - Emits join event  │
└──────────────────────┘
        │
        ▼ emit('join-channel')
┌──────────────────────┐
│  Socket.IO Server    │
│  - Adds client to    │
│    channel room      │
└──────────────────────┘

Room ID Format:
channel:{channelId}:messages
```

### Leaving a Channel

```
User Navigates Away
        │
        ▼
┌──────────────────────┐
│  ChannelClient.tsx   │
│  - Unmounts          │
│  - Cleanup triggered │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  useChat Hook        │
│  - Cleanup function  │
│  - Emits leave event │
└──────────────────────┘
        │
        ▼ emit('leave-channel')
┌──────────────────────┐
│  Socket.IO Server    │
│  - Removes client    │
│    from room         │
└──────────────────────┘
```

## 🔄 Connection Lifecycle

```
Page Load
    │
    ▼
┌─────────────────────┐
│  SocketProvider     │
│  - Initialize       │
└─────────────────────┘
    │
    ▼ io.connect()
┌─────────────────────┐
│  Socket.IO Server   │
│  - Accept connection│
│  - Assign socket ID │
└─────────────────────┘
    │
    ▼ 'connect' event
┌─────────────────────┐
│  SocketProvider     │
│  - Set connected    │
│  - Update status    │
└─────────────────────┘
    │
    ▼
Status: ● Connected
```

## 🔌 Component Hierarchy

```
app/layout.tsx
    │
    └── SocketProvider ◄─────── Manages global socket connection
            │
            ├── ModalProvider
            │
            └── Page Content
                    │
                    └── ChannelClient.tsx ◄─────── Uses socket via useChat hook
                            │
                            ├── MessageList.tsx ◄─── Displays messages
                            │
                            └── MessageInput.tsx ◄── Sends messages
```

## 📊 Data Flow

### State Management

```
┌──────────────────────────────────────────┐
│         Socket Connection State          │
│  (Managed by SocketProvider Context)     │
│                                           │
│  - socket: Socket | null                  │
│  - isConnected: boolean                   │
└──────────────────────────────────────────┘
                    │
                    │ Provided via Context
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────┐
│  useChat()   │      │  useSocket() │
│              │      │              │
│  - messages  │      │  - socket    │
│  - connected │      │  - isConnected│
└──────────────┘      └──────────────┘
        │
        │ Used by
        ▼
┌──────────────┐
│ Components   │
│              │
│ - Display    │
│ - Interact   │
└──────────────┘
```

## 🎯 Key Files and Responsibilities

```
┌─────────────────────────────────────────────────────────┐
│                    SERVER SIDE                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  pages/api/socket/io.ts                                  │
│  └─ Initialize Socket.IO server                          │
│  └─ Handle connections/disconnections                    │
│  └─ Manage room joins/leaves                             │
│                                                           │
│  pages/api/socket/messages.ts                            │
│  └─ Receive message from REST API                        │
│  └─ Broadcast to channel room                            │
│                                                           │
│  app/api/.../messages/route.ts                           │
│  └─ Validate & save message to DB                        │
│  └─ Trigger Socket.IO broadcast                          │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  components/providers/socket-provider.tsx                │
│  └─ Create socket connection                             │
│  └─ Manage connection state                              │
│  └─ Provide context to app                               │
│                                                           │
│  hooks/use-chat.ts                                       │
│  └─ Subscribe to channel events                          │
│  └─ Update message state                                 │
│  └─ Handle room joins/leaves                             │
│                                                           │
│  app/.../channels/[channelId]/client.tsx                │
│  └─ Load initial messages                                │
│  └─ Use real-time updates                                │
│  └─ Display connection status                            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 🌐 Network Layer

```
┌──────────────────────────────────────────────────────────┐
│                   Network Protocols                       │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  HTTP/HTTPS (REST API)                                    │
│  └─ POST /api/servers/.../messages                        │
│  └─ GET  /api/servers/.../messages                        │
│                                                            │
│  WebSocket (Socket.IO)                                    │
│  └─ ws://localhost:3000/api/socket/io                     │
│  └─ Persistent bidirectional connection                   │
│                                                            │
│  Fallbacks (Socket.IO)                                    │
│  └─ Long polling (if WebSocket fails)                     │
│  └─ HTTP polling (if long polling fails)                  │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

## 🔐 Security & Authentication

```
┌──────────────────────────────────────────┐
│           Request Flow                    │
├──────────────────────────────────────────┤
│                                           │
│  Client Request                           │
│       │                                   │
│       ▼                                   │
│  ┌──────────────┐                        │
│  │ Clerk Auth   │                        │
│  │ - Validate   │                        │
│  │ - Get userId │                        │
│  └──────────────┘                        │
│       │                                   │
│       ▼                                   │
│  ┌──────────────┐                        │
│  │ REST API     │                        │
│  │ - Check auth │                        │
│  │ - Save data  │                        │
│  └──────────────┘                        │
│       │                                   │
│       ▼                                   │
│  ┌──────────────┐                        │
│  │ Socket.IO    │                        │
│  │ - Broadcast  │                        │
│  └──────────────┘                        │
│                                           │
└──────────────────────────────────────────┘

Note: Socket.IO events are public within a room.
Authentication happens at REST API level.
```

## 📈 Scaling Considerations

### Current Architecture (Single Server)

```
┌──────────────┐
│   Server 1   │
│              │
│  Socket.IO   │
│  Rooms       │
└──────────────┘
    │    │    │
    │    │    └─── Client 3
    │    └──────── Client 2
    └───────────── Client 1
```

### Scaled Architecture (Multiple Servers)

```
┌──────────────┐     ┌──────────────┐
│   Server 1   │────▶│    Redis     │◀────┐
│  Socket.IO   │     │   Adapter    │     │
└──────────────┘     └──────────────┘     │
    │    │                                 │
    │    └── Client 2                      │
    └─────── Client 1                      │
                                           │
┌──────────────┐                           │
│   Server 2   │───────────────────────────┘
│  Socket.IO   │
└──────────────┘
    │
    └─────── Client 3

All servers share room state via Redis
Messages broadcast across all servers
```

## 🎨 Visual Summary

```
┌─────────────────────────────────────────────────────────┐
│                    USER EXPERIENCE                       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │  User types & sends message      │
        └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │  Message saved to database       │
        └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │  Socket.IO broadcasts to room    │
        └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │  All clients receive instantly   │
        └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │  UI updates without refresh      │
        └──────────────────────────────────┘
```

---

**Legend:**
- `│ ▼` = Data flow direction
- `◄──` = Dependency/relationship
- `───▶` = Connection/communication
- `[Component]` = React component
- `{Service}` = Backend service

For more details, see [SOCKETIO_SETUP.md](SOCKETIO_SETUP.md)
