import express from 'express';

import { validateBody } from '#src/core/validations/request.validation';
import {
  createPaymentController,
  returnPaymentMomoController,
  returnPaymentVnPayController,
} from '#src/app/payments/payments.controller';
import { createPaymentDto } from '#src/app/payments/dto/create-payments.dto';

const router = express.Router();

router.post('/create-payment', validateBody(createPaymentDto), createPaymentController);

// thanh toans Momo xong => Get tới endpoint api /return-payment-momo?resultCode=0
router.get('/return-payment-momo', returnPaymentMomoController);
router.get('/return-payment-vnpay', returnPaymentVnPayController);

export default router;
