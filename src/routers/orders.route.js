import express from 'express';
import {
  createOrderController,
  getAllOrdersByUserController,
  getOrderByIdController,
  updateOrderByIdController,
  removeOrderByIdController,
  createOrderCustomerController,
} from '#src/app/orders/orders.controller';
import { isAuthorized, isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { createOrderCustomerDto, createOrderDto } from '#src/app/orders/dto/create-order.dto';
import { validateBody } from '#src/core/validations/request.validation';
import { updateOrderDto } from '#src/app/orders/dto/update-order.dto';

const router = express.Router();

//***Có permistion thì thay isAuthorized = isAuthorizedAndHasPermission
router
  .post('/create-order', isAuthorized, validateBody(createOrderDto), createOrderController)
  .post('/create-order-customer', isAuthorized, validateBody(createOrderCustomerDto), createOrderCustomerController)
  .get('/get-all-orders', isAuthorized, getAllOrdersByUserController)
  .get('/get-order-by-id/:id', isAuthorized, getOrderByIdController)
  .put('/update-order-by-id/:id', isAuthorized, validateBody(updateOrderDto), updateOrderByIdController)
  .delete('/remove-order-by-id/:id', isAuthorized, removeOrderByIdController);

export default router;
