import express from 'express';
import {
  createOrderController,
  getAllOrdersByUserController,
  getOrderByIdController,
  updateOrderByIdController,
  removeOrderByIdController,
} from '#src/app/v1/orders/orders.controller';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { createOrderDto } from '#src/app/v1/orders/dto/create-order.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import { updateOrderDto } from '#src/app/v1/orders/dto/update-order.dto';

const router = express.Router();

router
  .post('/create-order', isAuthorizedAndHasPermission, validateSchema(createOrderDto), createOrderController)
  .get('/get-all-orders', isAuthorizedAndHasPermission, getAllOrdersByUserController)
  .get('/get-order-by-id/:id', isAuthorizedAndHasPermission, getOrderByIdController)
  .put(
    '/update-order-by-id/:id',
    isAuthorizedAndHasPermission,
    validateSchema(updateOrderDto),
    updateOrderByIdController,
  )
  .delete('/remove-order-by-id/:id', isAuthorizedAndHasPermission, removeOrderByIdController);

export default router;
