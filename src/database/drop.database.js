import Database from '#src/modules/database/init.database';
import { redisClient } from '#src/modules/redis/redis.service';
import LogUtils from '#src/utils/log.util';

async function dropDatabase() {
  const instance = await Database.getInstance({ type: 'mongodb', logging: true });
  LogUtils.info('DROP_DATABASE', 'Start drop database');

  try {
    await instance.connection.dropDatabase();
    await redisClient.flushall();
    LogUtils.success('DROP_DATABASE', 'Database dropped successful');
  } catch (err) {
    LogUtils.error('DROP_DATABASE', 'Error dropping the database', err);
  } finally {
    await Database.clear();
    await redisClient.quit();
  }
}

dropDatabase();
