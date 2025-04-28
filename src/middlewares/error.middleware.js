import HttpStatus from 'http-status-codes';
import { HttpException } from '#src/core/exception/http-exception';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { Code } from '#src/core/code/Code';
import { DiscordService } from '#src/modules/discord/discord.service';
import { errorIdGenerator } from '#src/utils/generator';

export const handleError = (err, req, res, _) => {
  const status = err.code || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = status >= HttpStatus.INTERNAL_SERVER_ERROR ? HttpStatus.getStatusText(status) : err.message;
  const codeMessage = err.codeMessage || 'SERVER_ERROR';
  const apiResponse = ApiResponse.error(status, codeMessage, message, err.data);

  if (process.env.NODE_ENV === 'development') {
    console.error(`\x1b[31mERROR [HTTP_TRAFFIC] {${req.method} ${req.url}} ${err.message}\x1b[0m`);
    console.log({ ...apiResponse, stack: err.stack });
  }

  // if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
  //   DiscordService.sendError({
  //     ...apiResponse,
  //     details: {
  //       errorId: errorIdGenerator.next().value,
  //       method: req.method,
  //       url: req.originalUrl,
  //       query: req.query,
  //       params: req.params,
  //       body: req.body,
  //       responseTime: req.responseTime,
  //     },
  //     client: {
  //       ip: req.ipv4,
  //       userAgent: req.headers['user-agent'],
  //       userId: req?.user?.id || null,
  //     },
  //     server: {
  //       hostname: req.hostname,
  //       env: process.env.NODE_ENV,
  //       version: '1.0.0',
  //     },
  //     stack: err.stack,
  //   });
  // }

  res.set('Content-Type', 'application/json');
  res.status(status).json(apiResponse);
};

export const notFound = (req, res, next) => {
  handleError(HttpException.new({ code: Code.ENDPOINT_NOT_FOUND }), req, res, next);
};
