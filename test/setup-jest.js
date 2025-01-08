import mongoose from "mongoose";

beforeEach(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  await mongoose.connection.db?.dropDatabase();
  await mongoose.connection.close();
});
