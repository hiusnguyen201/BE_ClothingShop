import express from 'express';
const router = express.Router();
import { validateSchema, validateFile } from '#middlewares/validate-request.middleware';
import {
  getAllCustomersController,
  createCustomerController,
  getCustomerByIdController,
  updateCustomerByIdController,
  removeCustomerByIdController,
} from '#app/customers/customers.controller';
import { createCustomerDto } from '#app/customers/dto/create-customer.dto';
import { updateCustomersDto } from '#app/customers/dto/update-customer.dto';

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
    validateSchema(createCustomerDto),
    createCustomerController,
  )
  .patch(
    '/update-customer-by-id/:id',
    validateFile(upload.single('avatar')),
    validateSchema(updateCustomersDto),
    updateCustomerByIdController,
  )
  .delete('/remove-customer-by-id/:id', removeCustomerByIdController);

export default router;
