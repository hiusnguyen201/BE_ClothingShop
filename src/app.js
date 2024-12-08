import express from "express";
import http from "http";
import mongoose from "mongoose";
import path, { dirname } from "path";
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

const app = express();

// Cors
app.use(cors());

// Rate limit
app.use(limiter);

// Trust proxy
app.set("trust proxy", true);

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

const swaggerFile = fs
  .readFileSync(path.join(process.cwd(), "/src/views/swagger.json"))
  .toString();

// Api Docs
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(JSON.parse(swaggerFile), {
    customCssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css",
  })
);

// Api version 1
app.use("/api/v1", routerV1);

// Catch 404
app.use(notFound);

// Handler Error
app.use(handleError);

const serverHost = "localhost" || "127.0.0.1";
const serverPort = config.port;
const serverApi = http.createServer(app);
serverApi.listen(serverPort, () => {
  console.log(`Server running at http://${serverHost}:${serverPort}`);
});

export default app;
