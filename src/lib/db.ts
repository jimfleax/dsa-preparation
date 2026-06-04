import mongoose from 'mongoose';

/**
 * Attempts to connect to MongoDB Atlas.
 * Non-fatal: the server will start even if the DB is unavailable.
 * Problem-tracking routes will fail gracefully when there's no connection.
 */
export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('WARNING: MONGODB_URI is not set. Problem tracking features will be unavailable.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${(error as Error).message}`);
    console.warn('Server will continue without MongoDB. Problem tracking will be unavailable.');
    return;
  }

  // Runtime error listener — logs errors without crashing
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err);
  });
};

// Graceful shutdown: close DB connection on process termination signals
const gracefulShutdown = async (signal: string) => {
  if (mongoose.connection.readyState === 1) {
    console.log(`\n${signal} received. Closing MongoDB connection...`);
    await mongoose.connection.close();
    console.log('MongoDB disconnected on app termination.');
  }
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
