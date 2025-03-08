import express from 'express';
const router = express.Router();

import usersRouter from '#routers/v2/users.router';

router.get('/ping', () => 'Hello world! PING 2');

router.use('/users', usersRouter);

export default router;
