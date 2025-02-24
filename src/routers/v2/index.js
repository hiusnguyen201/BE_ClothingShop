import express from 'express';
const router = express.Router();

import docsRouter from '#routers/v2/docs.router';
import usersRouter from '#routers/v2/users.router';

router.get('/ping', () => 'Hello world! PING');

router.use('/docs', docsRouter);

router.use('/users', usersRouter);

export default router;

/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Returns API operational status
 *     tags: [Ping]
 *     responses:
 *       200:
 *          description: API is running
 */
