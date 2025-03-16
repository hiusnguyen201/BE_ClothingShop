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

import { UploadUtils } from '#src/utils/upload.util';
import { ALLOW_IMAGE_MIME_TYPES } from '#src/core/constant';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router
  .get('/get-customers', isAuthorizedAndHasPermission, getAllCustomersController)
  .get('/get-customer-by-id/:id', isAuthorizedAndHasPermission, getCustomerByIdController)
  .post(
    '/create-customer',
    isAuthorizedAndHasPermission,
    validateFile(upload.single('avatar')),
    validateBody(CreateCustomerDto),
    createCustomerController,
  )
  .patch(
    '/update-customer-by-id/:id',
    isAuthorizedAndHasPermission,
    validateFile(upload.single('avatar')),
    validateBody(UpdateCustomerDto),
    updateCustomerByIdController,
  )
  .delete('/remove-customer-by-id/:id', isAuthorizedAndHasPermission, removeCustomerByIdController);

export default router;
