import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import helmet from "helmet";
import "reflect-metadata";

import { connectDB } from "./config/db";
import "./config/passport";
import { logger } from "./middleware/logger";

import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import mentorRoutes from "./routes/mentor.routes";
import paymentRoutes from "./routes/payment.routes";
import subscriptionRouter from "./routes/subscription.routes";
import connectionsRoutes from "./routes/connections.route";
import sessionRoutes from "./routes/session.route";
import chatRoutes from "./routes/chat.routes";
import dailyTask from "./routes/daily.task.routes";
import notificationRoutes from "./routes/notification.routes";

import container from "./config/inversify.config";
import { TYPES } from "./types/types";
import { ISubscriptionService } from "./services/interfaces/ISubscriptionService";

import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./config/socket";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

/* =========================
   ✅ CORS — SINGLE SOURCE
   ========================= */

//for production
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / postman
      if (origin === "https://spokely.live") return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

//for system run

// app.use(
//   cors({
//     origin: process.env.CLIENT_SIDE_URL,
//     credentials: true,
//     optionsSuccessStatus: 200,
//   })
// );

/* =========================
   ✅ BODY & COOKIE PARSING
   ========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =========================
   ✅ SESSION (cookies)
   ========================= */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      domain: ".spokely.live",
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: Number(process.env.SESSION_MAX_AGE),
    },
  })
);

/* =========================
   ✅ PASSPORT
   ========================= */
app.use(passport.initialize());
app.use(passport.session());

/* =========================
   ✅ LOGGING
   ========================= */
app.use(logger);

/* =========================
   ✅ ROUTES
   ========================= */
app.use("/api/payment", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users/connections", connectionsRoutes);
app.use("/api/users/session", sessionRoutes);
app.use("/api/subscription", subscriptionRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/daily/task", dailyTask);
app.use("/api/notifications", notificationRoutes);

/* =========================
   ✅ HELMET (AFTER ROUTES)
   ========================= */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

/* =========================
   ✅ HTTP + SOCKET.IO
   ========================= */
const server = createServer(app);

//server run

// const io = new Server(server, {
//   cors: {
//     origin: "https://spokely.live",
//     credentials: true,
//   },
// });

// if (!container.isBound(TYPES.SocketIO)) {
//   container.bind<Server>(TYPES.SocketIO).toConstantValue(io);
// }

// initSocket(io);

//machine run

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_SIDE_URL },
});

initSocket(io);

/* =========================
   ✅ START SERVER
   ========================= */
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const subscriptionService = container.get<ISubscriptionService>(
      TYPES.ISubscriptionService
    );
    subscriptionService.scheduleCronJobs();
    console.log("Subscription cron job scheduled.");
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
