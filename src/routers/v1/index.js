import express from 'express';
const router = express.Router();

import usersRouter from '#routers/v1/users.router';
import authRouter from '#routers/v1/auth.router';
import rolesRouter from '#routers/v1/roles.router';
import permissionsRouter from '#routers/v1/permissions.router';
import customersRouter from '#routers/v1/customers.router';
import categoriesRouter from '#routers/v1/categories.router';
import vouchersRouter from '#routers/v1/vouchers.router';
import accountRouter from '#routers/v1/account.router';

router.get('/ping', () => 'Hello world! PING 1');

router.use('/auth', authRouter);

router.use('/account', accountRouter);

router.use('/users', usersRouter);

router.use('/roles', rolesRouter);

router.use('/permissions', permissionsRouter);

router.use('/categories', categoriesRouter);

router.use('/customers', customersRouter);

router.use('/vouchers', vouchersRouter);

export default router;
