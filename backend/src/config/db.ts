import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("error while connecting to the database", err);
    throw err;
  }
};
