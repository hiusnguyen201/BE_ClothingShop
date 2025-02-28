import { NotFoundException } from '#core/exception/http-exception';
import { ApiResponse } from '#src/core/api/ApiResponse';
import HttpStatus from 'http-status-codes';

export const handleError = (err, req, res, next) => {
  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'development' ? err.message : HttpStatus.getStatusText(status);
  const apiResponse = ApiResponse.statusCode(status).error(message);

  if (process.env.NODE_ENV === 'development') {
    console.log({ ...apiResponse, stack: err.stack });
  }

  res.set('Content-Type', 'application/json');
  return res.status(status).json(apiResponse);
};

export const notFound = (req, res, next) => {
  handleError(new NotFoundException(), req, res, next);
};
