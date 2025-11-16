# Socket.IO Troubleshooting Guide

## Common Issues and Solutions

### 1. Socket Not Connecting

**Symptoms:**
- Connection indicator shows "● Disconnected" (red)
- Console shows connection errors
- No "✅ Socket connected" message

**Solutions:**

#### A. Check Environment Variable
```bash
# In .env.local file, add:
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important:** 
- Must start with `NEXT_PUBLIC_` to be available in browser
- Must match your actual dev server URL
- Restart dev server after adding

#### B. Verify Server is Running
```bash
# Make sure dev server is running:
npm run dev
```

#### C. Check Browser Console
Open browser DevTools (F12) and look for:
```
✅ Socket connected: [socket-id]
```

If you see errors like:
```
🔴 Socket connection error: ...
```
This means the Socket.IO server isn't accessible.

#### D. Clear Browser Cache
Sometimes cached WebSocket connections cause issues:
1. Open DevTools
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### 2. Messages Not Appearing in Real-Time

**Symptoms:**
- Socket shows connected
- Messages appear after page refresh
- No real-time updates

**Solutions:**

#### A. Check Channel Join
Look for this in console:
```
📢 Joined channel room: [channel-id]
```

If missing, the channel room join failed.

#### B. Verify API Route is Calling Socket.IO
The message POST should trigger Socket.IO emission. Check server console for:
```
Client connected: [socket-id]
Socket [socket-id] joined channel [channel-id]
```

#### C. Test with Network Tab
1. Open DevTools → Network tab
2. Filter for "WS" (WebSocket)
3. Send a message
4. Look for Socket.IO frames

#### D. Check Message Handler
Console should show:
```
📨 Received message in channel [channel-id]: {...}
```

### 3. Duplicate Messages

**Symptoms:**
- Same message appears multiple times
- Message list grows rapidly

**Solution:**

This is already handled in `useChat` hook, but if you still see duplicates:

```
⚠️ Message [message-id] already exists, skipping
```

This means the duplicate prevention is working. If you don't see this log but still get duplicates, there may be multiple socket listeners.

**Fix:**
- Make sure you're not creating multiple SocketProvider instances
- Check that useChat is only called once per component

### 4. Connection Drops Frequently

**Symptoms:**
- Status toggles between connected/disconnected
- Console shows repeated connect/disconnect

**Solutions:**

#### A. Network Issues
- Check your internet connection
- Disable VPN temporarily
- Check firewall settings

#### B. Development Hot Reload
This is normal during development:
- Socket disconnects when code changes
- Automatic reconnection should happen
- No action needed

#### C. Server Timeout
If using a reverse proxy or load balancer:
- Increase WebSocket timeout settings
- Configure keep-alive properly

### 5. CORS Errors

**Symptoms:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**

Socket.IO server is already configured with CORS:
```typescript
cors: {
  origin: "*",
  methods: ["GET", "POST"],
}
```

For production, restrict origins:
```typescript
cors: {
  origin: process.env.NEXT_PUBLIC_SITE_URL,
  methods: ["GET", "POST"],
}
```

### 6. Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

#### Windows (PowerShell):
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Alternative Port:
```bash
# Run on different port
npm run dev -- -p 3001
```

Don't forget to update `.env.local`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### 7. Socket.IO Not Loading in Production

**Symptoms:**
- Works in development
- Fails in production build

**Solutions:**

#### A. Check Build Output
```bash
npm run build
```

Make sure no errors related to Socket.IO.

#### B. Verify Environment Variables
Production environment must have:
```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

#### C. Check Server Configuration
If deploying to Vercel/Netlify:
- Socket.IO requires a Node.js server
- Serverless platforms may not support WebSockets
- Consider using dedicated hosting or Socket.IO managed service

### 8. TypeScript Errors

**Symptoms:**
```
Cannot find module '@/types/socket'
```

**Solution:**

Check that `types/socket.ts` exists and contains:
```typescript
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
```

### 9. Messages Sent Multiple Times

**Symptoms:**
- Single message creates multiple database entries
- API called multiple times

**Solution:**

This is a React issue, not Socket.IO. Check:
- React.StrictMode (causes double renders in dev)
- Multiple form submissions
- Button click handlers called multiple times

Add debouncing to message input:
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const onSubmit = async (e: any) => {
  e.preventDefault();
  if (isSubmitting) return; // Prevent double submit
  setIsSubmitting(true);
  // ... rest of submit logic
  setIsSubmitting(false);
};
```

## Debugging Checklist

Use this checklist to diagnose issues:

- [ ] `NEXT_PUBLIC_SITE_URL` is set in `.env.local`
- [ ] Dev server is running (`npm run dev`)
- [ ] No console errors in browser
- [ ] Socket connection shows: ✅ Socket connected
- [ ] Channel join shows: 📢 Joined channel room
- [ ] Test in two separate browser windows
- [ ] Network tab shows WebSocket connection (ws://)
- [ ] Server console shows client connections

## Testing Commands

### Test Socket Connection
```javascript
// Paste in browser console:
console.log('Socket connected:', window.socket?.connected);
```

### Manual Test
```javascript
// In browser console:
const { io } = require("socket.io-client");
const testSocket = io("http://localhost:3000", {
  path: "/api/socket/io"
});
testSocket.on("connect", () => console.log("Test connected!"));
```

## Getting Help

If you're still experiencing issues:

1. **Check Console Logs**
   - Browser console (F12)
   - Server console (terminal running `npm run dev`)

2. **Verify Setup**
   - Review `SOCKETIO_SETUP.md`
   - Check `IMPLEMENTATION_SUMMARY.md`

3. **Test Basic Functionality**
   - Use `lib/test-socket.ts` utility
   - Test with minimal example

4. **Debug Logging**
   All socket events are logged with emoji prefixes:
   - ✅ = Success
   - ❌ = Disconnection
   - 📢 = Room join
   - 📨 = Message received
   - 👋 = Room leave
   - 🔴 = Error
   - ⚠️ = Warning

## Performance Tips

### Optimize Socket.IO Performance

1. **Limit Message History**
   ```typescript
   // Only load last 50 messages initially
   const messages = await db.message.findMany({
     where: { channelId },
     take: 50,
     orderBy: { createdAt: "desc" },
   });
   ```

2. **Debounce Typing Indicators**
   ```typescript
   const debouncedTyping = debounce(() => {
     socket.emit("typing", { channelId });
   }, 300);
   ```

3. **Use Room-Based Broadcasting**
   Already implemented! Messages only go to relevant channels.

4. **Clean Up Listeners**
   Already handled in `useChat` hook cleanup function.

## Production Considerations

### Before Deploying to Production

1. **Update CORS Settings**
   ```typescript
   cors: {
     origin: process.env.NEXT_PUBLIC_SITE_URL,
     methods: ["GET", "POST"],
   }
   ```

2. **Add Redis Adapter** (for multiple servers)
   ```bash
   npm install @socket.io/redis-adapter redis
   ```

3. **Configure SSL/TLS**
   Use `wss://` instead of `ws://` for secure connections

4. **Monitor Performance**
   - Track connected clients
   - Monitor memory usage
   - Log message throughput

5. **Set Up Error Tracking**
   - Use Sentry or similar service
   - Log Socket.IO errors
   - Monitor disconnection rates

## Need More Help?

- Review: `SOCKETIO_QUICKSTART.md` for quick start
- Read: `SOCKETIO_SETUP.md` for detailed setup
- Check: `IMPLEMENTATION_SUMMARY.md` for overview
