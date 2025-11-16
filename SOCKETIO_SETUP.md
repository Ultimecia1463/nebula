# Socket.IO Implementation for Real-Time Messaging

This project now includes Socket.IO for real-time messaging capabilities.

## Features

- **Real-time message delivery**: Messages appear instantly for all users in a channel
- **Automatic reconnection**: Socket.IO handles connection drops gracefully
- **Connection status indicator**: Shows whether the client is connected to the Socket.IO server
- **Channel-based rooms**: Each channel has its own room for isolated messaging

## Architecture

### Server Components

1. **`pages/api/socket/io.ts`**: Main Socket.IO server initialization
   - Handles client connections/disconnections
   - Manages channel room joins/leaves

2. **`pages/api/socket/messages.ts`**: Message emission endpoint
   - Receives new messages from the REST API
   - Broadcasts messages to all clients in the channel

3. **`app/api/servers/[serverId]/channels/[channelId]/messages/route.ts`**: REST API route
   - Saves messages to database
   - Triggers Socket.IO emission

### Client Components

1. **`components/providers/socket-provider.tsx`**: Socket.IO context provider
   - Manages Socket.IO client connection
   - Provides socket instance and connection status

2. **`hooks/use-chat.ts`**: Custom hook for chat functionality
   - Handles real-time message updates
   - Manages channel room subscriptions

3. **`app/(main)/(route)/servers/[serverId]/channels/[channelId]/client.tsx`**: Channel page client
   - Loads initial messages
   - Uses `useChat` hook for real-time updates
   - Displays connection status

## Setup

### 1. Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, set this to your actual domain (e.g., `https://yourdomain.com`)

### 2. Installation

Dependencies are already installed:
- `socket.io` (server)
- `socket.io-client` (client)

### 3. Running the Application

```bash
npm run dev
```

The Socket.IO server will initialize on the same port as Next.js (default: 3000)

## How It Works

### Message Flow

1. User types a message and clicks send
2. `MessageInput` component sends POST request to REST API
3. REST API saves message to database
4. REST API calls Socket.IO endpoint to broadcast message
5. Socket.IO server emits message to all clients in the channel room
6. `useChat` hook receives the message via socket listener
7. Message list updates automatically

### Channel Rooms

- Each channel has a unique room ID: `channel:{channelId}:messages`
- Clients automatically join the room when viewing a channel
- Clients leave the room when navigating away
- Messages are only sent to clients in the same room

## Connection Status

A connection indicator is displayed at the top of each channel:
- **● Connected** (green): Real-time updates are working
- **● Disconnected** (red): Client is disconnected, reconnection will be attempted automatically

## Troubleshooting

### Socket.IO not connecting

1. Check that `NEXT_PUBLIC_SITE_URL` is set correctly
2. Ensure no firewall is blocking WebSocket connections
3. Check browser console for Socket.IO connection errors

### Messages not appearing in real-time

1. Verify Socket.IO server is initialized (check server console)
2. Ensure clients are joining channel rooms (check server logs)
3. Check that message emission is working (check network tab)

### Development vs Production

- **Development**: Socket.IO works with hot reload, but connection may reset
- **Production**: Consider using a Redis adapter for multiple server instances
- **Scaling**: For horizontal scaling, implement Redis pub/sub adapter

## Future Enhancements

Potential improvements:
- Message editing with Socket.IO updates
- Message deletion with Socket.IO updates
- Typing indicators
- Read receipts
- Online user presence
- Redis adapter for multi-server deployments
- Message reactions with real-time updates
