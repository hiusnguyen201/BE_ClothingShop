import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import logger from "morgan";
import cors from "cors";
import moment from "moment-timezone";
import cookieParser from "cookie-parser";
import HttpStatus from "http-status-codes";

import routerV1 from "#src/routes/v1/index";
import { handleError, notFound } from "#src/middlewares/error.middleware";
import { limiter } from "#src/middlewares/rate-limit.middleware";
import { swaggerUiSetup } from "#src/middlewares/swagger.middleware";
import { enhanceRouter } from "#src/utils/async-handler";

moment.tz("Asia/Ho_Chi_Minh").format();

// Connect MongoDb
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected successfully to MongoDB");
  })
  .catch((err) => {
    console.error("Connect to MongoDB failed", err);
  });

mongoose.set("debug", false);

const app = express();
app.set("trust proxy", true);
app.use(logger("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());
app.use(cors());
app.use(limiter);

// Add ipv4 to req
app.use((req, res, next) => {
  req.ipv4 =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  next();
});

// Ignore favicon request
app.get("/favicon.ico", (req, res) =>
  res.status(HttpStatus.NO_CONTENT).end()
);

// Api Docs - Must use swagger-ui-express v4.6.3
app.use("/api-docs", swaggerUiSetup);

// Api version 1
app.use("/api/v1", enhanceRouter(routerV1));

// Catch 404
app.use(notFound);

// Handler Error
app.use(handleError);

export default app;
