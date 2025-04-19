'use strict';
import Database from '#src/modules/database/init.database';
import LogUtils from '#src/utils/log.util';

async function dropDatabase() {
  const instance = await Database.getInstance({ type: 'mongodb', logging: true });
  LogUtils.info('DROP_DATABASE', 'Start drop database');

  try {
    await instance.connection.dropDatabase();
    LogUtils.success('DROP_DATABASE', 'Database dropped successful');
  } catch (err) {
    LogUtils.error('DROP_DATABASE', 'Error dropping the database', err);
  } finally {
    await Database.clear();
  }
}

dropDatabase();
