import express from 'express';

import { returnPaymentMoMoController } from '#src/app/payments/payments.controller';

const router = express.Router();

router.post('/return-payment-momo', returnPaymentMoMoController);

export default router;
