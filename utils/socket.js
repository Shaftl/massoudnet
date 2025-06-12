import { io } from "socket.io-client";

const socket = io("https://massoudnet-backend.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
