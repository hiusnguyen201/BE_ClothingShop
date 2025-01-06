import { NotFoundException } from "#src/core/exception/http-exception";
import HttpStatus from "http-status-codes";
import moment from "moment-timezone";

export const handleError = (err, req, res, next) => {
  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;

  const response = {
    status: status,
    error: err.error || HttpStatus.getStatusText(status),
    ...(err.message ? { message: err.message } : {}),
    timestamp: moment().valueOf(),
    url: req.originalUrl,
    ip: req.ipv4,
  };

  if (process.env.NODE_ENV === "development") {
    console.log({ ...response, stack: err.stack });
  }

  res.set("Content-Type", "application/json");
  return res.status(status).json(response);
};

export const notFound = (req, res, next) => {
  handleError(new NotFoundException(), req, res, next);
};
