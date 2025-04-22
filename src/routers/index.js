import express from 'express';
const router = express.Router();

import usersRouter from '#src/routers/users.router';
import authRouter from '#src/routers/auth.router';
import rolesRouter from '#src/routers/roles.router';
import permissionsRouter from '#src/routers/permissions.router';
import customersRouter from '#src/routers/customers.router';
import categoriesRouter from '#src/routers/categories.router';
import accountRouter from '#src/routers/account.router';
import productsRouter from '#src/routers/products.router';
import optionsRouter from '#src/routers/options.router';
import ordersRouter from '#src/routers/orders.router';
import reportRouter from '#src/routers/report';
import paymentsRouter from '#src/routers/payments.router';
import shippingAddressRouter from '#src/routers/shipping-address.router';
import cartsRouter from '#src/routers/carts.router';
import divisionsRouter from '#src/routers/divisions.router';
import { getAllProductsByCustomerController, getProductByIdController } from '#src/app/products/products.controller';
import {
  getAllCategoriesByCustomerController,
  getCategoryByIdController,
} from '#src/app/categories/categories.controller';

router.get('/ping', () => {
  return 'Hello world! PING 1';
});

router.use('/auth', authRouter);

router.use('/account', accountRouter);

router.use('/users', usersRouter);

router.use('/roles', rolesRouter);

router.use('/divisions', divisionsRouter);

router.use('/permissions', permissionsRouter);

router.use('/categories', categoriesRouter);

router.use('/customers', customersRouter);

router.use('/options', optionsRouter);

router.use('/products', productsRouter);

router.use('/orders', ordersRouter);

router.use('/payments', paymentsRouter);

router.use('/shipping-address', shippingAddressRouter);

router.use('/carts', cartsRouter);

router.use('/report', reportRouter);

router
  .get('/products/get-products-by-customer', getAllProductsByCustomerController)
  .get('/products/get-product-by-customer/:productId', getProductByIdController)
  .get('/get-categories-by-customer', getAllCategoriesByCustomerController)
  .get('/get-category-by-customer/:categoryId', getCategoryByIdController);

export default router;
