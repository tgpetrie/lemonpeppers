/* Node-based WebSocket (Socket.IO) smoke checker

Usage: node scripts/smoke_ws.js [wsUrl]
If wsUrl is not provided, it will use ws://localhost:5004/ws

This script attempts to connect via socket.io-client and prints success/failure.
*/

const { io } = require('socket.io-client');

const arg = process.argv[2];
const defaultUrl = process.env.VITE_WS_URL || process.env.WS_URL || 'ws://localhost:5004/ws';
const url = arg || defaultUrl;

console.log('Attempting Socket.IO connect to', url);

const socket = io(url, {
  transports: ['websocket'],
  upgrade: true,
  timeout: 8000,
  forceNew: true,
});

let finished = false;

socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO server. id=', socket.id);
  finished = true;
  socket.close();
  process.exit(0);
});

socket.on('connect_error', (err) => {
  console.error('❌ connect_error', err && err.message ? err.message : err);
  finished = true;
  process.exit(2);
});

socket.on('error', (err) => {
  console.error('❌ error', err);
  finished = true;
  process.exit(2);
});

setTimeout(() => {
  if (!finished) {
    console.error('❌ Timeout connecting to Socket.IO server');
    process.exit(2);
  }
}, 10000);
