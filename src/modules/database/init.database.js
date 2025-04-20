import moment from 'moment-timezone';
import { connectToMongoDb } from '#src/modules/database/mongodb.database';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';

const databaseStrategies = {
  mongodb: connectToMongoDb,
};

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
    const { type = null, logging = false, timezone = null } = options;

    if (!timezone) {
      moment.utc().format();
    } else {
      moment.tz(timezone).format();
    }

    if (!Database.instance) {
      const connectStrategy = databaseStrategies[type];
      if (!connectStrategy) {
        throw HttpException.new({
          code: Code.DATABASE_TYPE_NOT_SUPPORT,
          overrideMessage: `The database "${type}" not found`,
        });
      }

      const connection = await connectStrategy(options);
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
