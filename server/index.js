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

// Allowed origins setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://mingo-chat-app.vercel.app",
  process.env.FRONTEND_URL // Render Frontend URL yahan dynamically access hoga
].filter(Boolean); // Clean undefined if FRONTEND_URL is not set initially

// Express CORS Middlewares
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, postman, or health checks)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
  console.error("❌ Error:", err);
  res.status(statusCode).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Socket.IO CORS Setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  },
});

WebSocket(io);

httpServer.listen(PORT, async () => {
  await connectDB();
  console.log("Server is running on port", PORT);
});