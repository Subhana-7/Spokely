import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import {connectDB} from './config/db';
import userRoutes from './routes/user.routes';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users',userRoutes);


connectDB().then(() => {
  app.listen(process.env.PORT,() => {
    console.log('Server running on port 5000')
  })
})