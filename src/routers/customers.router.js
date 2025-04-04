import express from 'express';
const router = express.Router();
import { validateBody, validateQuery } from '#src/core/validations/request.validation';
import {
  getAllCustomersController,
  createCustomerController,
  getCustomerByIdController,
  updateCustomerByIdController,
  removeCustomerByIdController,
} from '#src/app/customers/customers.controller';
import { CreateCustomerDto } from '#src/app/customers/dtos/create-customer.dto';
import { UpdateCustomerDto } from '#src/app/customers/dtos/update-customer.dto';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { GetListCustomerDto } from '#src/app/customers/dtos/get-list-customer.dto';

router
  .post('/create-customer', isAuthorizedAndHasPermission, validateBody(CreateCustomerDto), createCustomerController)
  .get('/get-customers', isAuthorizedAndHasPermission, validateQuery(GetListCustomerDto), getAllCustomersController)
  .get('/get-customer-by-id/:customerId', isAuthorizedAndHasPermission, getCustomerByIdController)
  .put(
    '/update-customer-by-id/:customerId',
    isAuthorizedAndHasPermission,
    validateBody(UpdateCustomerDto),
    updateCustomerByIdController,
  )
  .delete('/remove-customer-by-id/:customerId', isAuthorizedAndHasPermission, removeCustomerByIdController);

export default router;
