import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://hornosbackend.onrender.com";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
});
