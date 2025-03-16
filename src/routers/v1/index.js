import express from 'express';
const router = express.Router();

import usersRouter from '#src/routers/v1/users.router';
import authRouter from '#src/routers/v1/auth.router';
import rolesRouter from '#src/routers/v1/roles.router';
import permissionsRouter from '#src/routers/v1/permissions.router';
import customersRouter from '#src/routers/v1/customers.router';
import categoriesRouter from '#src/routers/v1/categories.router';
import vouchersRouter from '#src/routers/v1/vouchers.router';
import accountRouter from '#src/routers/v1/account.router';
import ordersRouter from '#src/routers/v1/orders.route';
import paymentsRouter from '#src/routers/v1/payments.route';
import orderDetailsRouter from '#src/routers/v1/order-details.router';
import productsRouter from '#src/routers/v1/products.router';
import shippingAddressRouter from '#src/routers/v1/shipping-address.router';

router.get('/ping', () => 'Hello world! PING 1');

router.use('/auth', authRouter);

router.use('/account', accountRouter);

router.use('/users', usersRouter);

router.use('/roles', rolesRouter);

router.use('/permissions', permissionsRouter);

router.use('/categories', categoriesRouter);

router.use('/customers', customersRouter);

router.use('/vouchers', vouchersRouter);

router.use('/orders', ordersRouter);

router.use('/payments', paymentsRouter);

router.use('/order-details', orderDetailsRouter);

router.use('/products', productsRouter);

router.use('/shipping-address', shippingAddressRouter);

export default router;
