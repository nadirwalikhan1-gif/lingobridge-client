import { io } from 'socket.io-client';

// Debug: log all env vars
console.log('=== SOCKET ENV DEBUG ===');
console.log('VITE_WS_URL:', import.meta.env.VITE_WS_URL);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

// Use env var if available, otherwise hardcode Railway URL
const URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'wss://lingobridge-production.up.railway.app';

console.log('🔌 FINAL SOCKET URL:', URL);

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket(token, role = 'client') {
  if (socket?.connected) return socket;

  console.log('🔌 Connecting socket to:', URL);

  socket = io(URL, {
    auth: { token, role },
    transports: ['polling', 'websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id, '| role:', role);
    socket.emit('register', { role });
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  socket.on('reconnect', () => {
    console.log('🔄 Socket reconnected — re-registering role:', role);
    socket.emit('register', { role });
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}