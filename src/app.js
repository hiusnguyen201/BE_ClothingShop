import express from "express";
import http from "http";
import mongoose from "mongoose";
import logger from "morgan";
import cors from "cors";
import moment from "moment-timezone";
import httpStatus from "http-status-codes";
// var createError = require("http-errors");
// var cookieParser = require("cookie-parser");

import routerV1 from "#src/routes/v1/index";
import config from "#src/config";
import { handleError, notFound } from "#src/middlewares/error.middleware";
import { limiter } from "#src/middlewares/rate-limit.middleware";
import { swaggerUiSetup } from "#src/middlewares/swagger.middleware";
import asyncHandler from "#src/utils/async-handler";

moment.tz(config.timezone).format();
const app = express();

// Cors
app.use(cors());

// Rate limit
app.use(limiter);

// Trust proxy
app.set("trust proxy", true);

// view engine setup
// app.set("views", path.join(process.cwd(), "src/views"));
// app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
// app.use(cookieParser());
// app.use(express.static(path.join(process.cwd(), "/public")));

// Connect MongoDb
mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log("Connected successfully to MongoDB");
  })
  .catch((err) => {
    console.error("Connect to MongoDB failed", err);
  });

// Ignore favicon request
app.get("/favicon.ico", (_, res) =>
  res.status(httpStatus.NO_CONTENT).end()
);

// Api Docs
app.use("/api-docs", swaggerUiSetup);

// Api version 1
app.use("/api/v1", asyncHandler(routerV1));

// Catch 404
app.use(notFound);

// Handler Error
app.use(handleError);

const serverApi = http.createServer(app);
serverApi.listen(config.port, () => {
  if (config.nodeEnv === "development") {
    console.log(`
    ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗     ███████╗████████╗ █████╗ ██████╗ ████████╗      
    ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗    ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝      
    ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝    ███████╗   ██║   ███████║██████╔╝   ██║         
    ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗    ╚════██║   ██║   ██╔══██║██╔══██╗   ██║         
    ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║    ███████║   ██║   ██║  ██║██║  ██║   ██║██╗██╗██╗
    ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝╚═╝╚═╝╚═╝
    `);
  }

  console.log(`Server is running on http://localhost:${config.port}`);
});

export default app;
