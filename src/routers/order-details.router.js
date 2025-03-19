import express from 'express';

import { validateBody } from '#src/core/validations/request.validation';
import { createOrderDetailController } from '#src/app/orderDetails/order-details.controller';
import { createOrderDetailDto } from '#src/app/orderDetails/dto/create-order-detail.dto';

const router = express.Router();

router.post('/create-order-detail', validateBody(createOrderDetailDto), createOrderDetailController);

export default router;
