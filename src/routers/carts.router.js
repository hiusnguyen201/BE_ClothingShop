import express from 'express';
const router = express.Router();
import {
  addToCartController,
  removeFromCartController,
  getCartController,
  clearCartController,
} from '#src/app/carts/carts.controller';
import { isAuthorizedAndIsCustomer } from '#src/middlewares/jwt-auth.middleware';

router
  .post('/add-item', isAuthorizedAndIsCustomer, addToCartController)
  .get('/get-cart', isAuthorizedAndIsCustomer, getCartController)
  .delete('/clear-cart', isAuthorizedAndIsCustomer, clearCartController)
  .delete('/remove-item/:productVariantId', isAuthorizedAndIsCustomer, removeFromCartController);
export default router;
