import express, { Request, Response, NextFunction, RequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import "./config/passport";
import connectionsRoutes from "./routes/connections.route";
import sessionRoutes from "./routes/session.route";
import "reflect-metadata";
import { logger } from "./middleware/logger";
import helmet from "helmet";
import mentorRoutes from "./routes/mentor.routes";
import paymentRoutes from "./routes/payment.routes";
import subscriptionRouter from "./routes/subscription.routes";
import container from "./config/inversify.config";
import { TYPES } from "./types/types";
import { ISubscriptionService } from "./services/interfaces/ISubscriptionService";
import chatRoutes from "./routes/chat.routes";
import dailyTask from "./routes/daily.task.routes";
import notificationRoutes from "./routes/notification.routes";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./config/socket";

dotenv.config();
const app = express();

app.set("trust proxy", 1);


//for hosting run
// app.use(
//   cors({
//     origin: "https://spokely.live",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );



//for system run
// app.use(
//   cors({
//     origin: process.env.CLIENT_SIDE_URL,
//     credentials: true,
//     optionsSuccessStatus: 200,
//   })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: Number(process.env.SESSION_MAX_AGE),
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(logger);
app.use(helmet());


// app.options("*", cors({
//     origin: "https://spokely.live",
//     credentials: true
// }));


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

const server = createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "https://spokely.live",
//     credentials: true,
//   },
// });


const io = new Server(server);

if (!container.isBound(TYPES.SocketIO)) {
  container.bind<Server>(TYPES.SocketIO).toConstantValue(io);
}

initSocket(io);

connectDB()
  .then(async () => {
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
