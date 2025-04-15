import express from 'express';
import {
  createOrderController,
  getOrderByIdController,
  confirmOrderController,
  createShippingOrderController,
  webHookUpdateOrder,
  processOrderController,
  cancelOrderController,
  getAllOrdersController,
  getAllOrdersByCustomerIdController,
  getOrderByCustomerIdController,
  cancelOrderByCustomerController,
} from '#src/app/orders/orders.controller';
import {
  isAuthorized,
  isAuthorizedAndHasPermission
} from '#src/middlewares/jwt-auth.middleware';
import { createOrderDto } from '#src/app/orders/dtos/create-order.dto';
import {
  validateBody,
  validateQuery
} from '#src/core/validations/request.validation';
import { createOrderGhnDto } from '#src/app/orders/dtos/create-order-ghn.dto';
import { GetListOrderDto } from '#src/app/orders/dtos/get-list-order.dto';

const router = express.Router();

//***Có permistion thì thay isAuthorized = isAuthorizedAndHasPermission
router
  .post('/create-order',
    // isAuthorized, 
    validateBody(createOrderDto),
    createOrderController)
  .get('/get-all-orders',
    // isAuthorized,
    validateQuery(GetListOrderDto),
    getAllOrdersController)
  .get('/get-all-orders-by-customer',
    // isAuthorized,
    validateQuery(GetListOrderDto),
    getAllOrdersByCustomerIdController)
  .get('/get-order-by-id/:orderId',
    // isAuthorized,
    getOrderByIdController)
  .get('/get-order-by-customer-id/:orderId',
    // isAuthorized,
    getOrderByCustomerIdController)
  .post('/confirm-order',
    // isAuthorized,
    validateBody(createOrderGhnDto),
    confirmOrderController)
  .post('/process-order',
    // isAuthorized,
    validateBody(createOrderGhnDto),
    processOrderController)
  .post('/create-shipping-order',
    // isAuthorized,
    validateBody(createOrderGhnDto),
    createShippingOrderController)
  .post('/cancel-order',
    // isAuthorized,
    validateBody(createOrderGhnDto),
    cancelOrderController)
  .post('/cancel-order-by-customer',
    // isAuthorized,
    validateBody(createOrderGhnDto),
    cancelOrderByCustomerController)

  .post('/webhook/update-order-status',
    webHookUpdateOrder)
export default router;
