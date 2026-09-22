import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import AuthRouter from "./src/router/authRouter.js";
import UserRouter from "./src/router/userRouter.js";
import connectDB from "./src/config/db.js";

import http from 'http';
import { Server } from 'socket.io';
import WebSocket from "./src/config/webSocket.js";

const app = express();

// Trust reverse proxy for HTTPS cookie detection on Render/cloud hosts
app.set("trust proxy", 1);

// Allowed origins setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://mingo-chat-app.vercel.app",
  process.env.FRONTEND_URL // Render Frontend URL yahan dynamically access hoga
].filter(Boolean); // Clean undefined if FRONTEND_URL is not set initially

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.indexOf(origin) !== -1) return true;
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
  // Support all Vercel deployment URLs (production & preview branches)
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)*vercel\.app$/.test(origin)) return true;
  return false;
};

// Express CORS Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/auth", AuthRouter);
app.use("/user", UserRouter);

// Health check
app.get("/", (req, res) => {
  res.status(200).json("Hello from Mingo Chat App Server");
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  console.error("❌ Error:", err.message || err);
  res.status(statusCode).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Socket.IO CORS Setup
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  },
});

WebSocket(io);

httpServer.listen(PORT, async () => {
  await connectDB();
  console.log("Server is running on port", PORT);
});