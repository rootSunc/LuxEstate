import mongoose from "mongoose";

let connectionPromise;

export const connectDatabase = async () => {
  if (!process.env.MONGO) {
    throw new Error("MONGO must be configured");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO, {
        serverSelectionTimeoutMS: 5000,
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  await connectionPromise;
  return mongoose.connection;
};

export const requireDatabase = async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
};

export const getDatabaseStatus = () => ({
  configured: Boolean(process.env.MONGO),
  connected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
});
