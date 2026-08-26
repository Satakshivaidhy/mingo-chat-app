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

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173"],
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

// Error handlers
// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  console.error("❌ Error:", err);
  res.status(statusCode).json({ success: false, message });
});

// Not found handler
// app.use((req, res) => {
//   res.status(404).json("Not Found");
// });

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],              //process.env.FRONTEND_URL
    credentials: true,
    methods: ["GET", "POST"]
  },
});

WebSocket(io);

httpServer.listen(PORT, async () => {
  await connectDB();
  console.log("Server is running on port", PORT);
});
