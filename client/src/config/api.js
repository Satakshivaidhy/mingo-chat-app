import axios from "axios";

const rawUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4500";
const baseURL = rawUrl.replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;