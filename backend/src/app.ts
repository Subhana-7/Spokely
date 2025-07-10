import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import './config/passport';
import connectionsRoutes from './routes/connections.route'
import sessionRoutes from './routes/session.route';

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


app.use(
  session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users/connections',connectionsRoutes);
app.use('/api/users/session',sessionRoutes)



connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});