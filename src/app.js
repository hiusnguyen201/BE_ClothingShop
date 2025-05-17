import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import HttpStatus from 'http-status-codes';
import helmet from 'helmet';
import compression from 'compression';

import '#src/cron/backup-logs.cron';
import '#src/core/validations/index';
import router from '#src/routers/index';
import { handleErrorMiddleware, notFoundMiddleware } from '#src/middlewares/error.middleware';
import { limiter } from '#src/middlewares/rate-limit.middleware';
import { enhanceRouter } from '#src/utils/async-handler';
import Database from '#src/modules/database/init.database';
import { handleTimeoutMiddleware } from '#src/middlewares/timeout.middleware';
import { corsConfig } from '#src/config/cors.config';
import { requestContextMiddleware } from '#src/middlewares/request-context.middleware';

// Connect to Database
Database.getInstance({ logging: false });

const app = express();

app.disable('etag');
app.use(helmet());
app.use(compression());
app.use(cors(corsConfig));
app.use(limiter);

app.set('trust proxy', true);
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Handle Timeout
app.use(handleTimeoutMiddleware);

// Set request context
app.use(requestContextMiddleware);

// Ignore favicon request
app.get('/favicon.ico', (req, res) => res.status(HttpStatus.NO_CONTENT).end());

app.use('/api', enhanceRouter(router));

// Catch 404
app.use(notFoundMiddleware);

// Handle error
app.use(handleErrorMiddleware);

export default app;
