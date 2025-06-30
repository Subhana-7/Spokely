import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {connectDB} from './config/db';
import userRoutes from './routes/user.routes';
import passport from 'passport';
import session from 'express-session';
import './config/passport';
import cookieParser = require('cookie-parser');import adminRoutes from './routes/admin.routes'

dotenv.config();
const app = express();
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}));
app.use(express.json());

app.use(
  session({
    secret: 'session-secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users',userRoutes);
app.use("/api/admin", adminRoutes);


connectDB().then(() => {
  app.listen(process.env.PORT,() => {
    console.log('Server running on port 5000')
  })
})