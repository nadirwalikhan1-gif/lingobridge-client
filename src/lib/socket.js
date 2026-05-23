import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL;

let socket = null;

export function getSocket() {
  return socket;
}

export function connectSocket(token, role = 'client') {
  if (socket?.connected) return socket;

  socket = io(URL, {
    auth: { token, role },
    transports: ['polling', 'websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id, '| role:', role);
    // Emit register so server joins role-based rooms and replays pending requests
    socket.emit('register', { role });
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  // Re-emit register on reconnect so room membership is restored
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