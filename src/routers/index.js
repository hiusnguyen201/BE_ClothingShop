import express from 'express';
const router = express.Router();

import usersRouter from '#src/routers/users.router';
import authRouter from '#src/routers/auth.router';
import rolesRouter from '#src/routers/roles.router';
import permissionsRouter from '#src/routers/permissions.router';
import customersRouter from '#src/routers/customers.router';
import categoriesRouter from '#src/routers/categories.router';
import vouchersRouter from '#src/routers/vouchers.router';
import accountRouter from '#src/routers/account.router';
import ordersRouter from '#src/routers/orders.route';
import paymentsRouter from '#src/routers/payments.route';
import orderDetailsRouter from '#src/routers/order-details.router';
import productsRouter from '#src/routers/products.router';
import shippingAddressRouter from '#src/routers/shipping-address.router';

router.get('/ping', () => {
  return 'Hello world! PING 1';
});

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
