import express from 'express';
import {
  createOrderController,
  getOrderByIdController,
  confirmOrderController,
  createShippingOrderController,
  cancelOrderController,
  getAllOrdersController,
  // updateOrderController,
  removeOrderController,
  processingOrderController,
} from '#src/app/orders/orders.controller';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

const router = express.Router();

router
  .post('/create-order', isAuthorizedAndHasPermission, createOrderController)
  .get('/get-orders', isAuthorizedAndHasPermission, getAllOrdersController)
  .get('/get-order-by-id/:orderId', isAuthorizedAndHasPermission, getOrderByIdController)
  .post('/confirm-order', isAuthorizedAndHasPermission, confirmOrderController)
  .post('/create-shipping-order', isAuthorizedAndHasPermission, createShippingOrderController)
  .post('/cancel-order', isAuthorizedAndHasPermission, cancelOrderController)
  .post('/processing-order', isAuthorizedAndHasPermission, processingOrderController)
  .post('/create-ship-order', isAuthorizedAndHasPermission, createShippingOrderController)
  .delete('/remove-order-by-id/:orderId', isAuthorizedAndHasPermission, removeOrderController);

export default router;
