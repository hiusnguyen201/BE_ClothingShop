import { Code } from '#src/core/code/Code';
import { HttpException } from '#src/core/exception/http-exception';

export const handleTimeoutMiddleware = (req, res, next) => {
  const timeout = +process.env.REQUEST_TTL_IN_SECONDS * 1000;

  const timer = setTimeout(() => next(HttpException.new({ code: Code.TIMEOUT_API_RESPONSE })), timeout);

  res.on('finish', () => clearTimeout(timer));
  next();
};
