import express from 'express';
import {
  createOrderController,
  getOrderByIdController,
  confirmOrderController,
  createShippingOrderController,
  webHookUpdateOrder,
  cancelOrderController,
  getAllOrdersController,
  // updateOrderController,
  removeOrderController,
} from '#src/app/orders/orders.controller';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { createOrderDto } from '#src/app/orders/dtos/create-order.dto';
import { validateBody, validateParams, validateQuery } from '#src/core/validations/request.validation';
import { createOrderGhnDto } from '#src/app/orders/dtos/create-order-ghn.dto';
import { GetListOrderDto } from '#src/app/orders/dtos/get-list-order.dto';
// import { updateOrderDto } from '#src/app/orders/dtos/update-order.dto';
import { GetOrderDto } from '#src/app/orders/dtos/get-order.dto';

const router = express.Router();

router
  .post('/create-order', isAuthorizedAndHasPermission, validateBody(createOrderDto), createOrderController)
  .get('/get-orders', isAuthorizedAndHasPermission, validateQuery(GetListOrderDto), getAllOrdersController)
  .get('/get-order-by-id/:orderId', isAuthorizedAndHasPermission, validateParams(GetOrderDto), getOrderByIdController)
  .post('/confirm-order', isAuthorizedAndHasPermission, validateBody(createOrderGhnDto), confirmOrderController)
  .post(
    '/create-shipping-order',
    isAuthorizedAndHasPermission,
    validateBody(createOrderGhnDto),
    createShippingOrderController,
  )
  .post('/cancel-order', isAuthorizedAndHasPermission, validateBody(createOrderGhnDto), cancelOrderController)
  .post(
    '/create-ship-order',
    isAuthorizedAndHasPermission,
    validateBody(createOrderGhnDto),
    createShippingOrderController,
  )
  .delete(
    '/remove-order-by-id/:orderId',
    // isAuthorized,
    // validateBody(createOrderGhnDto),
    removeOrderController,
  );

export default router;
