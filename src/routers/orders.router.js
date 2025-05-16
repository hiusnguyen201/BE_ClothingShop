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
  exportOrdersController,
  webHookUpdateOrderController,
} from '#src/app/orders/orders.controller';
import { isAuthorized, can } from '#src/middlewares/jwt-auth.middleware';
import { EXPORT_PERMISSIONS, ORDER_PERMISSIONS } from '#src/database/data/permissions-data';

const router = express.Router();

router
  .post('/create-order', isAuthorized, can([ORDER_PERMISSIONS.CREATE_ORDER.name]), createOrderController)
  .get('/get-orders', isAuthorized, can([ORDER_PERMISSIONS.GET_ORDERS.name]), getAllOrdersController)
  .get('/export-excel', isAuthorized, can([EXPORT_PERMISSIONS.ORDER_EXCEL.name]), exportOrdersController)
  .get(
    '/get-order-by-id/:orderId',
    isAuthorized,
    can([ORDER_PERMISSIONS.GET_DETAILS_ORDER.name]),
    getOrderByIdController,
  )
  .post('/confirm-order', isAuthorized, can([ORDER_PERMISSIONS.CONFIRM_ORDER.name]), confirmOrderController)
  .post(
    '/create-shipping-order',
    isAuthorized,
    can([ORDER_PERMISSIONS.CREATE_SHIP_ORDER.name]),
    createShippingOrderController,
  )
  .post('/cancel-order', isAuthorized, can([ORDER_PERMISSIONS.CANCEL_ORDER.name]), cancelOrderController)
  .post('/processing-order', isAuthorized, can([ORDER_PERMISSIONS.PROCESSING_ORDER.name]), processingOrderController)
  .delete(
    '/remove-order-by-id/:orderId',
    isAuthorized,
    can([ORDER_PERMISSIONS.REMOVE_ORDER.name]),
    removeOrderController,
  );

router.post('/webhook/ship-order', webHookUpdateOrderController);

export default router;
