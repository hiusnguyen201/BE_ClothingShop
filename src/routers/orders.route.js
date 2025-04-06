import express from 'express';
import {
  createOrderController,
  getAllOrdersByUserController,
  getOrderByIdController,
  updateOrderByIdController,
  removeOrderByIdController,
  createOrderGhnController,
} from '#src/app/orders/orders.controller';
import { isAuthorized, isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { createOrderDto } from '#src/app/orders/dtos/create-order.dto';
import { validateBody } from '#src/core/validations/request.validation';
import { updateOrderDto } from '#src/app/orders/dtos/update-order.dto';
import { createOrderGhnDto } from '#src/app/orders/dtos/create-order-ghn.dto';

const router = express.Router();

//***Có permistion thì thay isAuthorized = isAuthorizedAndHasPermission
router
  .post('/create-order',
    // isAuthorized, 
    validateBody(createOrderDto), createOrderController)
  .get('/get-all-orders', isAuthorized, getAllOrdersByUserController)
  .get('/get-order-by-id/:id',
    // isAuthorized,
    getOrderByIdController)
  .put('/update-order-by-id/:id', isAuthorized, validateBody(updateOrderDto), updateOrderByIdController)
  .delete('/remove-order-by-id/:id', isAuthorized, removeOrderByIdController)
  .post('/create-order-ghn', isAuthorized, validateBody(createOrderGhnDto), createOrderGhnController);

export default router;
