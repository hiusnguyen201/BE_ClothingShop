import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import HttpStatus from 'http-status-codes';
import helmet from 'helmet';
import compression from 'compression';

import '#src/core/validations/index';
import router from '#src/routers/index';
import { handleError, notFound } from '#src/middlewares/error.middleware';
import { limiter } from '#src/middlewares/rate-limit.middleware';
import { enhanceRouter } from '#src/utils/async-handler';
import Database from '#src/modules/database/init.database';
import { handleTimeout } from '#src/middlewares/timeout.middleware';
import { corsConfig } from '#src/config/cors.config';

// Connect to Database
Database.getInstance({
  type: 'mongodb',
  logging: false,
  timezone: 'Asia/Ho_Chi_Minh',
});

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors(corsConfig));
app.use(limiter);

app.set('trust proxy', true);
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

app.use(handleTimeout);

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return next();
  }

  const startTime = process.hrtime();
  const originalJson = res.json;
  res.json = function (body) {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const time = seconds * 1000 + nanoseconds / 1000000;

    if (body && typeof body === 'object') {
      body.responseTime = time;
    }

    return originalJson.call(this, body);
  };
  next();
});

// Add ipv4 to req
app.use((req, res, next) => {
  req.ipv4 = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  next();
});

// Ignore favicon request
app.get('/favicon.ico', (req, res) => res.status(HttpStatus.NO_CONTENT).end());

// Api version 1
app.use('/api', enhanceRouter(router));

// Catch 404
app.use(notFound);

app.use(handleError);

export default app;
