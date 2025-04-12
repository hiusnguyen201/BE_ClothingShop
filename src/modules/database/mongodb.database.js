import mongoose from 'mongoose';

export const connectToMongoDb = (options) => {
  // if (options?.logging) {
  //   mongoose.set('debug', true);
  //   mongoose.set('debug', { color: true });
  // }

  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 60000,
      minPoolSize: 10,
    })
    .then(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Connected successful to MongoDB');
      }
    })
    .catch((err) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Connect to MongoDB failed', err);
      }
    });

  return mongoose.connection;
};
