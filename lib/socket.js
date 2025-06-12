import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io("https://massoudnet-backend.onrender.com", {
      withCredentials: true,
    });
  }
  return socket;
}
