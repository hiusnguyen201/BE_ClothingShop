import express from 'express';
const router = express.Router();
import {
  getAllCustomersController,
  createCustomerController,
  getCustomerByIdController,
  updateCustomerByIdController,
  removeCustomerByIdController,
} from '#src/app/customers/customers.controller';
import { can, isAuthorized } from '#src/middlewares/jwt-auth.middleware';
import { CUSTOMERS_PERMISSIONS } from '#src/database/data/permissions-data';

router
  .post('/create-customer', isAuthorized, can([CUSTOMERS_PERMISSIONS.CREATE_CUSTOMER.name]), createCustomerController)
  .get('/get-customers', isAuthorized, can([CUSTOMERS_PERMISSIONS.GET_CUSTOMERS.name]), getAllCustomersController)
  .get(
    '/get-customer-by-id/:customerId',
    isAuthorized,
    can([CUSTOMERS_PERMISSIONS.GET_DETAILS_CUSTOMER.name]),
    getCustomerByIdController,
  )
  .put(
    '/update-customer-by-id/:customerId',
    isAuthorized,
    can([CUSTOMERS_PERMISSIONS.EDIT_CUSTOMER.name]),
    updateCustomerByIdController,
  )
  .delete(
    '/remove-customer-by-id/:customerId',
    isAuthorized,
    can([CUSTOMERS_PERMISSIONS.REMOVE_CUSTOMER.name]),
    removeCustomerByIdController,
  );

export default router;
