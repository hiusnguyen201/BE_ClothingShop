import * as dotenv from "dotenv";
dotenv.config();

const env = process.env;

const config = {
  dirname: process.cwd(),

  timezone: "Asia/Ho_Chi_Minh",

  nodeEnv: env.NODE_ENV,
  port: env.PORT || 3000,

  mongoUri: env.MONGO_URI || "mongodb://localhost:27017/clothes-store", // example: mongodb://localhost:27017/your-db,

  jwtSecret:
    env.JWT_SECRET ||
    "fJDtwC9Gp2x81z7bXRjWmO6xGkx4rUOV99h15fWcKmHacLkAH5stLqky3Lo5Ju8t",
  jwtExpiresIn: env.JWT_EXPIRES_IN || "7d",

  otpExpiresMinutes: 5,
  resetTokenExpiresMinutes: 30,

  mailtrap: {
    host: env.MAILTRAP_HOST || "smtp.gmail.com",
    port: env.MAILTRAP_PORT || 465,
    user: env.MAILTRAP_AUTH_USER,
    pass: env.MAILTRAP_AUTH_PASS,
    clientUrl: env.CLIENT_URL,
    token: env.MAILTRAP_TOKEN,
  },

  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },

  cloudinary: {
    cloudName: env.CLOUD_NAME,
    apiKey: env.CLOUD_API_KEY,
    apiSecret: env.CLOUD_API_SECRET,
  },
};

export default config;
