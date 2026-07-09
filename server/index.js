import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import matchesRouter from "./routes/matches.js";
import messagesRouter from "./routes/messages.js";
import requestsRouter from "./routes/requests.js";
import recommendRouter from "./routes/recommend.js";
import seedRouter from "./routes/seed.js";
import statsRouter from "./routes/stats.js";
import ratingsRouter from "./routes/ratings.js";
import sosRouter from "./routes/sos.js";
import swipeRouter from "./routes/swipe.js";
import usersRouter from "./routes/users.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = new Map();
app.set("io", io);
app.set("userSocketMap", userSocketMap);

io.on("connection", (socket) => {
  socket.on("register", (userId) => {
    if (userId) {
      userSocketMap.set(String(userId), socket.id);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });

  socket.on("joinRoom", (matchId) => {
    if (matchId) {
      socket.join(String(matchId));
    }
  });

  socket.on("leaveRoom", (matchId) => {
    if (matchId) {
      socket.leave(String(matchId));
    }
  });
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/users", usersRouter);
app.use("/api/recommend", recommendRouter);
app.use("/api/swipe", swipeRouter);
app.use("/api/matches", matchesRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/ratings", ratingsRouter);
app.use("/api/sos", sosRouter);
app.use("/api/seed", seedRouter);

app.use((err, _req, res, _next) => {
  if (err?.code === 11000) {
    return res.status(409).json({ message: "Duplicate record" });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      details: Object.values(err.errors).map((item) => item.message),
    });
  }

  return res.status(500).json({
    message: err?.message || "Internal server error",
  });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully ✅");
    
    const port = Number(process.env.PORT) || 5000;
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is busy. Kill it with: taskkill /F /PID $(netstat -ano | findstr :${port})`);
        process.exit(1);
      }
    });

    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}
startServer();
