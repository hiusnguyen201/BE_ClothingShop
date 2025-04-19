import express from 'express';

import { validateBody, validateQuery } from '#src/core/validations/request.validation';
import {
  // createPaymentController,
  // returnPaymentCodController,
  returnPaymentMoMoController,
  returnPaymentVnPayController,
} from '#src/app/payments/payments.controller';
// import { createPaymentDto } from '#src/app/payments/dtos/create-payments.dto';

const router = express.Router();

// router.post('/create-payment', validateBody(createPaymentDto), createPaymentController);

// thanh toans Momo xong => Get tới endpoint api /return-payment-momo?resultCode=0

router.get('/return-payment-momo', returnPaymentMoMoController);
router.get('/return-payment-vnpay', returnPaymentVnPayController);
// router.get('/return-payment-cod', returnPaymentCodController);

export default router;
