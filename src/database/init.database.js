import { getDatabaseStrategies } from "#src/database/strategy.database";
import moment from "moment-timezone";

class Database {
  static instance = null;
  static options = {
    type: null, // mongodb, postgres, mysql
    logging: false,
    timezone: null,
  };

  constructor(options) {
    if (!options?.timezone) {
      moment.utc().format();
    } else {
      moment.tz(options.timezone).format();
    }

    this.connect(options);
  }

  connect(options) {
    const connectStrategy = getDatabaseStrategies[options?.type];
    if (connectStrategy) {
      connectStrategy(options);
    } else {
      throw new Error(`The database "${options?.type}" not found`);
    }
  }

  static getInstance(options) {
    if (!Database.instance) {
      Database.instance = new Database(options);
    }
    return Database.instance;
  }
}

export default Database;
