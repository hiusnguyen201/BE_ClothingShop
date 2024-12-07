import express from "express";
import mongoose from "mongoose";
import path from "path";
import logger from "morgan";
import fs from "fs";
import cors from "cors";
import moment from "moment-timezone";
moment.tz(config.timezone).format();
import swaggerUi from "swagger-ui-express";
// var createError = require("http-errors");
// var cookieParser = require("cookie-parser");

import routerV1 from "#src/routes/v1/index";
import config from "#src/config";
import { handleError, notFound } from "#src/middlewares/error.middleware";
import { limiter } from "#src/middlewares/rate-limit.middleware";
import swaggerDocument from "./swagger.json" assert { type: "json" };

const app = express();

// Cors
app.use(cors());

// Rate limit
app.use(limiter);

// view engine setup
// app.set("views", path.join(config.dirname, "src/views"));
// app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(express.static(path.join(config.dirname, "/public")));

// Connect MongoDb
mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log("Connected successfully to MongoDB");
  })
  .catch((err) => {
    console.error("Connect to MongoDB failed", err);
  });

// Api Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Api version 1
app.use("/api/v1", routerV1);

// Catch 404
app.use(notFound);

// Handler Error
app.use(handleError);

export default app;
