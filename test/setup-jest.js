import Database from '#src/modules/database/init.database';
import dotenv from 'dotenv';
dotenv.config({ path: './env/.env.test' });

beforeAll(async () => {
  Database.getInstance({ type: 'mongodb', logging: process.env.NODE_ENV === 'development' });
});

beforeEach(async () => {
  await Database.instance.connection.dropDatabase();
});

afterAll(async () => {
  await Database.clear();
});
