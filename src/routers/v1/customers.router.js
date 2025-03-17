import express from 'express';
const router = express.Router();
import { validateBody, validateFile } from '#src/core/validations/request.validation';
import {
  getAllCustomersController,
  createCustomerController,
  getCustomerByIdController,
  updateCustomerByIdController,
  removeCustomerByIdController,
} from '#src/app/v1/customers/customers.controller';
import { CreateCustomerDto } from '#src/app/v1/customers/dtos/create-customer.dto';
import { UpdateCustomerDto } from '#src/app/v1/customers/dtos/update-customer.dto';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router
  .get('/get-customers', isAuthorizedAndHasPermission, getAllCustomersController)
  .get('/get-customer-by-id/:id', isAuthorizedAndHasPermission, getCustomerByIdController)
  .post('/create-customer', isAuthorizedAndHasPermission, validateBody(CreateCustomerDto), createCustomerController)
  .patch(
    '/update-customer-by-id/:id',
    isAuthorizedAndHasPermission,
    validateBody(UpdateCustomerDto),
    updateCustomerByIdController,
  )
  .delete('/remove-customer-by-id/:id', isAuthorizedAndHasPermission, removeCustomerByIdController);

export default router;
