import express from "express";
import mongoose from "mongoose";
import path from "path";
import logger from "morgan";
import cors from "cors";
import moment from "moment-timezone";
moment.tz(config.timezone).format();
// var createError = require("http-errors");
// var cookieParser = require("cookie-parser");
// console.log(moment(new Date()).format("DD/MM/YYYY HH:mm:ss a"));

import routerV1 from "#src/routes/v1/index.js";
import config from "#src/config.js";

const app = express();

// Cors
app.use(cors());

// view engine setup
app.set("views", path.join(config.dirname, "src/views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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

// Api version 1
app.use("/api/v1", routerV1);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
