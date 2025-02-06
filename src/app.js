"use strict";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import HttpStatus from "http-status-codes";
import helmet from "helmet";
import compression from "compression";

import routerV1 from "#src/routes/v1/index";
import { handleError, notFound } from "#src/middlewares/error.middleware";
import { limiter } from "#src/middlewares/rate-limit.middleware";
import { swaggerUiSetup } from "#src/middlewares/swagger.middleware";
import { enhanceRouter } from "#src/utils/async-handler";
import Database from "#src/database/init.database";

// Connect to Database
Database.getInstance({
  type: "mongodb",
  logging: process.env.NODE_ENV === "development",
  timezone: "Asia/Ho_Chi_Minh",
});

const app = express();
app.use(helmet());
app.use(compression());
app.set("trust proxy", true);

app.use(
  morgan(process.env.NODE_ENV === "development" ? "dev" : "combined")
);
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
