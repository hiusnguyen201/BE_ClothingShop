import express from 'express';
const router = express.Router();
import { validateBody, validateFile } from '#core/validations/request.validation';
import {
  getAllCustomersController,
  createCustomerController,
  getCustomerByIdController,
  updateCustomerByIdController,
  removeCustomerByIdController,
} from '#src/app/v1/customers/customers.controller';
import { createCustomerDto } from '#src/app/v1/customers/dtos/create-customer.dto';
import { updateCustomersDto } from '#src/app/v1/customers/dtos/update-customer.dto';

import { UploadUtils } from '#utils/upload.util';
import { ALLOW_IMAGE_MIME_TYPES } from '#core/constant';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-customers', getAllCustomersController)
  .get('/get-customer-by-id/:id', getCustomerByIdController)
  .post(
    '/create-customer',
    validateFile(upload.single('avatar')),
    validateBody(createCustomerDto),
    createCustomerController,
  )
  .patch(
    '/update-customer-by-id/:id',
    validateFile(upload.single('avatar')),
    validateBody(updateCustomersDto),
    updateCustomerByIdController,
  )
  .delete('/remove-customer-by-id/:id', removeCustomerByIdController);

export default router;
