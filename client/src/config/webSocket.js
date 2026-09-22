import { io } from "socket.io-client";

const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4500";
const backendUrl = rawUrl.replace(/\/+$/, "");

const socketAPI = io(backendUrl, { withCredentials: true });

export default socketAPI;