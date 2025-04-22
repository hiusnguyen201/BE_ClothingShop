import express from 'express';
const router = express.Router();
import {
  getAllCustomersController,
  createCustomerController,
  getCustomerByIdController,
  updateCustomerByIdController,
  removeCustomerByIdController,
} from '#src/app/customers/customers.controller';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router
  .post('/create-customer', isAuthorizedAndHasPermission, createCustomerController)
  .get('/get-customers', isAuthorizedAndHasPermission, getAllCustomersController)
  .get('/get-customer-by-id/:customerId', isAuthorizedAndHasPermission, getCustomerByIdController)
  .put('/update-customer-by-id/:customerId', isAuthorizedAndHasPermission, updateCustomerByIdController)
  .delete('/remove-customer-by-id/:customerId', isAuthorizedAndHasPermission, removeCustomerByIdController);

export default router;
