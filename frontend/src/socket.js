import { io } from "socket.io-client";

// Replace with your server URL
const URL = "http://localhost:8080"; 

export const socket = io(URL, {
  autoConnect: false 
});