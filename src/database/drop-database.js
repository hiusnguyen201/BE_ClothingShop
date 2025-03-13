'use strict';
import Database from '#src/modules/database/init.database';

Database.getInstance({ type: 'mongodb', logging: process.env.NODE_ENV === 'development' });

async function dropDatabase() {
  try {
    await Database.instance.connection.dropDatabase();
    console.log('Database dropped successfully');

    console.log('Connection closed');
  } catch (error) {
    console.error('Error dropping the database:', error);
  } finally {
    await Database.close();
  }
}

dropDatabase();
