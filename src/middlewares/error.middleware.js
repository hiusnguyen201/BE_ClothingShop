'use strict';
import { HttpException } from '#src/core/exception/http-exception';
import { ApiResponse } from '#src/core/api/ApiResponse';
import chalk from 'chalk';
import HttpStatus from 'http-status-codes';
import { Code } from '#src/core/code/Code';

export const handleError = (err, req, res, _) => {
  const status = err.code || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = process.env.NODE_ENV === 'development' ? err.message : HttpStatus.getStatusText(status);
  const codeMessage = err.codeMessage || 'SERVER_ERROR';
  const apiResponse = ApiResponse.error(status, codeMessage, message, err.data);

  if (process.env.NODE_ENV === 'development') {
    console.error(chalk.red(`ERROR [HTTP_TRAFFIC] {${req.method} ${req.url}} ${err.message}`));
    console.log({ ...apiResponse, stack: err.stack });
  }

  res.set('Content-Type', 'application/json');
  res.status(status).json(apiResponse);
};

export const notFound = (req, res, next) => {
  handleError(HttpException.new({ code: Code.ENDPOINT_NOT_FOUND }), req, res, next);
};
