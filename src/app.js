'use strict';
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

// Connect to Database
Database.getInstance({
  type: 'mongodb',
  logging: process.env.NODE_ENV === 'development',
  timezone: 'Asia/Ho_Chi_Minh',
});

const app = express();
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: true,
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  }),
);
app.use(limiter);

app.set('trust proxy', true);
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

app.use(handleTimeout);

// Add ipv4 to req
app.use((req, res, next) => {
  req.baseUrl = req.protocol + '://' + req.get('host');
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
