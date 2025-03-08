import express from 'express';

import { validateSchema } from '#src/middlewares/validate-request.middleware';
import { createPaymentController } from '#src/app/v1/payments/payments.controller';
import { createPaymentDto } from '#src/app/v1/payments/dto/create-payments.dto';

const router = express.Router();

router.post('/create-payment', validateSchema(createPaymentDto), createPaymentController);

export default router;
