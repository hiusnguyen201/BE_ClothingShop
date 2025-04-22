import express from 'express';
const router = express.Router();

import {
  createShippingAddressController,
  getAllShippingAddressController,
  getShippingAddressByIdController,
  updateShippingAddressByIdController,
  removeShippingAddressByIdController,
  setDefaultShippingAddressByIdController,
} from '#src/app/shipping-address/shipping-address.controller';
import { isAuthorizedAndIsCustomer } from '#src/middlewares/jwt-auth.middleware';

router
  .post('/create-shipping-address', isAuthorizedAndIsCustomer, createShippingAddressController)
  .get('/get-shipping-address', isAuthorizedAndIsCustomer, getAllShippingAddressController)
  .get('/get-shipping-address-by-id/:shippingAddressId', isAuthorizedAndIsCustomer, getShippingAddressByIdController)
  .put(
    '/update-shipping-address-by-id/:shippingAddressId',
    isAuthorizedAndIsCustomer,
    updateShippingAddressByIdController,
  )
  .delete(
    '/remove-shipping-address-by-id/:shippingAddressId',
    isAuthorizedAndIsCustomer,
    removeShippingAddressByIdController,
  )
  .patch('/set-default-by-id/:shippingAddressId', isAuthorizedAndIsCustomer, setDefaultShippingAddressByIdController);

export default router;
