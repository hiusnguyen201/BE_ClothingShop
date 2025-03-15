import express from 'express';

import { validateBody } from '#src/core/validations/request.validation';
import { createShippingAddressDto } from '#src/app/v1/shipping-address/dto/create-shipping-address.dto';
import { createShippingAddressController } from '#src/app/v1/shipping-address/shipping-address.controller';
import { isAuthorized } from '#src/middlewares/jwt-auth.middleware';

const router = express.Router();

router.post(
  '/create-shipping-address',
  isAuthorized,
  validateBody(createShippingAddressDto),
  createShippingAddressController,
);

export default router;
