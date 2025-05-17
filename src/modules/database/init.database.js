import { connectToMongoDb } from '#src/modules/database/mongodb.database';
import { startChangeStreamLogger } from '#src/modules/database/change-stream-logger.database';

class Database {
  static instance = null;
  static options = {
    type: null, // mongodb, postgres, mysql
    logging: false,
    timezone: null,
  };

  constructor(connection) {
    this.connection = connection;
  }

  static async getInstance(options) {
    if (!Database.instance) {
      const connection = await connectToMongoDb(options);
      startChangeStreamLogger(connection);
      Database.instance = new Database(connection);
    }

    return Database.instance;
  }

  static async clear() {
    if (Database.instance?.connection?.close) {
      await Database.instance.connection.close();
    }
    Database.instance = null;
  }
}

export default Database;
