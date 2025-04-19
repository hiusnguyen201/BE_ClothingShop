import LogUtils from '#src/utils/log.util';
import mongoose from 'mongoose';

export const connectToMongoDb = async (options) => {
  if (options?.logging) {
    mongoose.set('debug', true);
    mongoose.set('debug', { color: true });
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 60000,
      minPoolSize: 10,
    });

    if (process.env.NODE_ENV === 'development') {
      LogUtils.success('CONNECT_DATABASE', 'Connected successful to MongoDB');
    }

    return mongoose.connection;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      LogUtils.error('CONNECT_DATABASE', 'Connect to MongoDB failed', err);
    }
    throw err;
  }
};
