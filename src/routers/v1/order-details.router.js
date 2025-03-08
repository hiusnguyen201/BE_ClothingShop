import express from 'express';

import { validateSchema } from '#src/core/validations/request.validation';
import { createOrderDetailController } from '#src/app/v1/orderDetails/order-details.controller';
import { createOrderDetailDto } from '#src/app/v1/orderDetails/dto/create-order-detail.dto';

const router = express.Router();

router.post('/create-order-detail', validateSchema(createOrderDetailDto), createOrderDetailController);

export default router;
