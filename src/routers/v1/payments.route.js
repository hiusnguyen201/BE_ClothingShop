import express from 'express';

import { validateSchema } from '#src/core/validations/request.validation';
import {
  createPaymentController,
  returnPaymentMomoController,
  returnPaymentVnPayController,
} from '#src/app/v1/payments/payments.controller';
import { createPaymentDto } from '#src/app/v1/payments/dto/create-payments.dto';

const router = express.Router();

router.post('/create-payment', validateSchema(createPaymentDto), createPaymentController);

router.get('/return-payment-momo', returnPaymentMomoController);
router.get('/return-payment-vnpay', returnPaymentVnPayController);

export default router;
