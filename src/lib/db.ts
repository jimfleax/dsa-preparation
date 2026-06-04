import mongoose from 'mongoose';

/**
 * Establishes a single Mongoose connection to MongoDB Atlas.
 * Must be called once before the Express server starts accepting requests.
 * Exits the process on connection failure to prevent the server from running without a DB.
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('FATAL: MONGODB_URI is not defined in environment variables. Exiting.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${(error as Error).message}`);
    process.exit(1);
  }

  // Runtime error listener — logs errors without crashing
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err);
  });
};

// Graceful shutdown: close DB connection on process termination signals
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Closing MongoDB connection...`);
  await mongoose.connection.close();
  console.log('MongoDB disconnected on app termination.');
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
