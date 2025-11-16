/**
 * Socket.IO Test Utility
 * 
 * This file can be used to verify Socket.IO is working correctly.
 * Open browser console and paste this code to test the connection.
 */

// Test 1: Check if socket is connected
console.log('Socket.IO Test Suite');
console.log('===================');

// Get the socket from window (if exposed in dev mode)
// Or manually create a test connection:
import { io } from 'socket.io-client';

const testSocket = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
  path: '/api/socket/io',
  addTrailingSlash: false,
});

testSocket.on('connect', () => {
  console.log('✅ Socket connected:', testSocket.id);
});

testSocket.on('disconnect', () => {
  console.log('❌ Socket disconnected');
});

// Test 2: Join a test channel
const testChannelId = 'test-channel-id';
testSocket.emit('join-channel', testChannelId);
console.log(`📢 Joined channel: ${testChannelId}`);

// Test 3: Listen for messages
testSocket.on(`channel:${testChannelId}:messages`, (message) => {
  console.log('📨 Received message:', message);
});

// Cleanup function
export const cleanup = () => {
  testSocket.emit('leave-channel', testChannelId);
  testSocket.disconnect();
  console.log('🧹 Test socket cleaned up');
};

console.log('Run cleanup() to disconnect test socket');
