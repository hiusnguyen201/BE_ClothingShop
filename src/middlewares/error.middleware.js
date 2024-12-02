import { NotFoundException } from "#src/core/exception/http-exception";
import HttpStatus from "http-status-codes";
import moment from "moment-timezone";
import { UploadUtils } from "#src/utils/upload.util";

export const handleError = (err, req, res, next) => {
  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;

  const response = {
    status: status,
    error: err.error || HttpStatus.getStatusText(status),
    ...(err.message ? { message: err.message } : {}),
    timestamp: moment().valueOf(),
    url: req.originalUrl,
  };

  if (req.app.get("env") === "development") {
    console.log({ ...response, stack: err.stack });
  }

  //  Clear file
  UploadUtils.clearUploadFile([
    req.file,
    ...(Array.isArray(req.files) ? req.files : []),
  ]);

  res.set("Content-Type", "application/json");
  return res.status(status).json(response);
};

export const notFound = (req, res, next) => {
  handleError(new NotFoundException(), req, res, next);
};
