import express from 'express';
import {
  createOrderController,
  getAllOrdersByUserController,
  getOrderByIdController,
  updateOrderByIdController,
  removeOrderByIdController,
} from '#src/app/v1/orders/orders.controller';
import { isAuthorized } from '#src/middlewares/jwt-auth.middleware';
import { createOrderDto } from '#src/app/v1/orders/dto/create-order.dto';
import { validateSchema } from '#src/middlewares/validate-request.middleware';
import { updateOrderDto } from '#src/app/v1/orders/dto/update-order.dto';

const router = express.Router();

router
  .post('/create-order', validateSchema(createOrderDto), isAuthorized, createOrderController)
  .get('/get-all-orders', isAuthorized, getAllOrdersByUserController)
  .get('/get-order-by-id/:id', isAuthorized, getOrderByIdController)
  .put('/update-order-by-id/:id', validateSchema(updateOrderDto), isAuthorized, updateOrderByIdController)
  .delete('/remove-order-by-id/:id', removeOrderByIdController);

export default router;
