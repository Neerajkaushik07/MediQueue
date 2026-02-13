import mongoose from "mongoose";
import logger from './logger.js';

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/mediqueue`);
    logger.info("Database Connected");
  } catch (error) {
    logger.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
