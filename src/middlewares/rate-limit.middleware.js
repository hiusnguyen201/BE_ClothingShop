'use strict';
import { rateLimit } from 'express-rate-limit';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
  handler: (req, res, next) => next(HttpException.new({ code: Code.TOO_MANY_REQUESTS })),
  validate: { trustProxy: false },
});
