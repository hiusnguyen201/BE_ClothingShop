import { NotFoundException } from '#core/exception/http-exception';
import { ApiResponse } from '#src/core/api/ApiResponse';
import HttpStatus from 'http-status-codes';

export const handleError = (err, req, res, next) => {
  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'development' ? err.message : HttpStatus.getStatusText(status);
  const apiResponse = ApiResponse.error(status, message, err.error);

  if (process.env.NODE_ENV === 'development') {
    console.error(`[HTTP_TRAFFIC] {${req.method} ${req.url}} ${err.message}`);
    console.log({ ...apiResponse, stack: err.stack });
  }

  res.set('Content-Type', 'application/json');
  res.status(status).json(apiResponse);
};

export const notFound = (req, res, next) => {
  handleError(new NotFoundException(), req, res, next);
};
