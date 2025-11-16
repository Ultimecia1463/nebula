# Quick Start - Socket.IO Setup

## ⚡ Getting Started

### 1. Add Environment Variable

Create or update your `.env.local` file with:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important**: In production, change this to your actual domain (e.g., `https://yourdomain.com`)

### 2. Run the Development Server

```bash
npm run dev
```

### 3. Test Real-Time Messaging

1. Open your app in **two different browser windows** (or use incognito mode)
2. Navigate to the same channel in both windows
3. Send a message from one window
4. Watch it appear instantly in the other window! 🎉

## ✅ Connection Status

You'll see a connection indicator at the top of each channel:
- **● Connected** (green) = Real-time updates working
- **● Disconnected** (red) = Reconnecting...

## 📝 What Was Implemented

### New Files Created:
- `pages/api/socket/io.ts` - Socket.IO server initialization
- `pages/api/socket/messages.ts` - Message broadcasting endpoint
- `components/providers/socket-provider.tsx` - Socket.IO React context
- `hooks/use-chat.ts` - Custom hook for real-time chat
- `types/socket.ts` - TypeScript types for Socket.IO

### Modified Files:
- `app/layout.tsx` - Added SocketProvider
- `app/(main)/(route)/servers/[serverId]/channels/[channelId]/client.tsx` - Integrated real-time updates
- `app/api/servers/[serverId]/channels/[channelId]/messages/route.ts` - Added Socket.IO emission
- `components/chat/message-input.tsx` - Added error handling
- `.env.example` - Added NEXT_PUBLIC_SITE_URL

## 🔧 How It Works

1. **User sends message** → Saved to database
2. **API triggers Socket.IO** → Message broadcasted to channel room
3. **All connected clients** → Receive and display message instantly

## 📚 Need More Details?

See `SOCKETIO_SETUP.md` for complete documentation, troubleshooting, and advanced configuration.

## 🚀 Next Steps

Consider implementing:
- Typing indicators
- Online user presence
- Message editing/deletion with real-time sync
- Read receipts
