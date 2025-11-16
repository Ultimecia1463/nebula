# ✅ Socket.IO Setup Checklist

Use this checklist to ensure Socket.IO is properly configured and working.

## 📋 Pre-Setup Checklist

- [ ] Node.js and npm installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Database connected and migrations run
- [ ] Basic app functionality working

## 🔧 Installation Checklist

- [x] ✅ Socket.IO packages installed (`socket.io`, `socket.io-client`)
- [x] ✅ Server files created (`pages/api/socket/`)
- [x] ✅ Client components created (`components/providers/socket-provider.tsx`)
- [x] ✅ Custom hooks created (`hooks/use-chat.ts`)
- [x] ✅ Type definitions created (`types/socket.ts`)
- [x] ✅ Layout updated with SocketProvider
- [x] ✅ Message API updated to emit socket events
- [x] ✅ Channel client updated to use real-time updates

## ⚙️ Configuration Checklist

Complete these steps to activate Socket.IO:

### 1. Environment Variable
- [ ] Create or open `.env.local` file
- [ ] Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- [ ] Save the file

### 2. Restart Server
- [ ] Stop the dev server (Ctrl+C)
- [ ] Start the dev server (`npm run dev`)
- [ ] Verify server starts without errors

### 3. Verify Socket.IO Initialization
- [ ] Check server console for "Socket.IO server initialized" (or similar)
- [ ] No errors in server console related to Socket.IO

## 🧪 Testing Checklist

### Browser Console Testing
- [ ] Open browser DevTools (F12)
- [ ] Navigate to Console tab
- [ ] Look for: `✅ Socket connected: [socket-id]`
- [ ] No red errors in console

### Connection Status Testing
- [ ] Navigate to any channel
- [ ] See "● Connected" (green) indicator at top of channel
- [ ] Indicator should appear within a few seconds

### Real-Time Messaging Testing
- [ ] Open app in Chrome (normal window)
- [ ] Navigate to a test channel
- [ ] Open app in Chrome Incognito/Private window
- [ ] Sign in (can be same or different user)
- [ ] Navigate to the SAME channel in both windows
- [ ] Send a message in Window 1
- [ ] Message appears in Window 1 ✅
- [ ] Message appears in Window 2 instantly ✅

### Console Logs Testing
In browser console, verify you see:
- [ ] `✅ Socket connected: [id]`
- [ ] `📢 Joined channel room: [channel-id]`
- [ ] `📨 Received message in channel [channel-id]` (when receiving)

## 🐛 Troubleshooting Checklist

If something isn't working, check these:

### Socket Not Connecting
- [ ] `NEXT_PUBLIC_SITE_URL` is set in `.env.local`
- [ ] Dev server was restarted after adding environment variable
- [ ] Port 3000 is available (not used by another app)
- [ ] No firewall blocking WebSocket connections

### Messages Not Real-Time
- [ ] Socket shows as connected (green indicator)
- [ ] Console shows "📢 Joined channel room" message
- [ ] No errors in browser or server console
- [ ] Testing in two different windows/browsers

### Errors in Console
- [ ] Read the error message
- [ ] Check [SOCKETIO_TROUBLESHOOTING.md](SOCKETIO_TROUBLESHOOTING.md)
- [ ] Verify all files were created correctly

## 📁 File Verification Checklist

Verify these files exist:

### Server Files
- [ ] `pages/api/socket/io.ts`
- [ ] `pages/api/socket/messages.ts`

### Client Files
- [ ] `components/providers/socket-provider.tsx`
- [ ] `hooks/use-chat.ts`

### Type Files
- [ ] `types/socket.ts`

### Documentation Files
- [ ] `SOCKETIO_QUICKSTART.md`
- [ ] `SOCKETIO_SETUP.md`
- [ ] `IMPLEMENTATION_SUMMARY.md`
- [ ] `SOCKETIO_TROUBLESHOOTING.md`
- [ ] `SOCKETIO_CHECKLIST.md` (this file)

### Modified Files
- [ ] `app/layout.tsx` (includes SocketProvider)
- [ ] `app/(main)/(route)/servers/[serverId]/channels/[channelId]/client.tsx` (uses useChat)
- [ ] `app/api/servers/[serverId]/channels/[channelId]/messages/route.ts` (emits events)
- [ ] `.env.example` (includes NEXT_PUBLIC_SITE_URL)

## ✨ Success Criteria

You'll know Socket.IO is working correctly when:

- ✅ No errors in browser console
- ✅ No errors in server console
- ✅ Green "● Connected" indicator visible
- ✅ Messages sent in one window appear instantly in another
- ✅ Console logs show socket connection and channel joins
- ✅ No page refresh needed to see new messages

## 🎯 Next Steps After Setup

Once everything is working:

- [ ] Remove console.log statements (optional, for production)
- [ ] Test with multiple users
- [ ] Test with multiple channels
- [ ] Test connection drop/reconnection (disconnect WiFi briefly)
- [ ] Consider implementing additional features:
  - [ ] Typing indicators
  - [ ] Online presence
  - [ ] Message editing
  - [ ] Message deletion
  - [ ] Read receipts
  - [ ] Reactions

## 📖 Documentation Quick Links

- **New to Socket.IO?** Start with [SOCKETIO_QUICKSTART.md](SOCKETIO_QUICKSTART.md)
- **Want details?** Read [SOCKETIO_SETUP.md](SOCKETIO_SETUP.md)
- **Having issues?** Check [SOCKETIO_TROUBLESHOOTING.md](SOCKETIO_TROUBLESHOOTING.md)
- **What was changed?** See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

## 🆘 Need Help?

If you've gone through this checklist and Socket.IO still isn't working:

1. **Check Troubleshooting Guide**: [SOCKETIO_TROUBLESHOOTING.md](SOCKETIO_TROUBLESHOOTING.md)
2. **Review Console Logs**: Both browser and server
3. **Verify Environment**: `console.log(process.env.NEXT_PUBLIC_SITE_URL)` in browser
4. **Test Basic Connection**: Use the test utility in `lib/test-socket.ts`

## 📝 Notes

- Socket.IO works in development mode with hot reload
- Connection may briefly disconnect during code changes (this is normal)
- For production, consider adding Redis adapter for scaling
- WebSocket connections may be blocked by some corporate firewalls

---

**Current Status**: 
- Installation: ✅ Complete
- Configuration: ⏳ Needs environment variable
- Testing: ⏳ Pending

**Action Required**: 
1. Add `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local`
2. Restart dev server
3. Test in two browser windows

Good luck! 🚀
