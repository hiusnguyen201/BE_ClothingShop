'use strict';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import HttpStatus from 'http-status-codes';
import helmet from 'helmet';
import compression from 'compression';

import '#src/core/validations/index';
import routerV1 from '#src/routers/v1/index';
import routerV2 from '#src/routers/v2/index';
import { handleError, notFound } from '#src/middlewares/error.middleware';
import { limiter } from '#src/middlewares/rate-limit.middleware';
import { enhanceRouter } from '#src/utils/async-handler';
import Database from '#src/modules/mongodb/init.database';

// Connect to Database
Database.getInstance({
  type: 'mongodb',
  logging: process.env.NODE_ENV === 'development',
  timezone: 'Asia/Ho_Chi_Minh',
});

const app = express();
app.use(helmet());
app.use(compression());
app.set('trust proxy', true);

app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(cors());
app.use(limiter);

// Add ipv4 to req
app.use((req, res, next) => {
  req.ipv4 = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  next();
});

// Ignore favicon request
app.get('/favicon.ico', (req, res) => res.status(HttpStatus.NO_CONTENT).end());

app.use('/api-docs', (req, res) => res.redirect(process.env.POSTMAN_URL_DOCS));

// Api version 1
app.use('/api/v1', enhanceRouter(routerV1));

// Api version 2
app.use('/api/v2', enhanceRouter(routerV2));

// Catch 404
app.use(notFound);

// Handler Error
app.use(handleError);

export default app;
