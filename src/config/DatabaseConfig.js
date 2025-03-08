import '#config/env';

export class DatabaseConfig {
  static DB_HOST = process.env.DB_HOST;

  static DB_PORT = Number(process.env.DB_PORT);

  static DB_NAME = process.env.DB_NAME;

  static DB_USERNAME = process.env.DB_USERNAME;

  static DB_PASSWORD = process.env.DB_PASSWORD;

  static DB_ENABLE_LOG = Boolean(process.env.DB_ENABLE_LOG);
}
