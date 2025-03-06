import express from "express";

import { validateSchema } from "#src/middlewares/validate-request.middleware";
import { createOrderDetailController } from "#src/modules/orderDetails/order-details.controller";
import { createOrderDetailDto } from "#src/modules/orderDetails/dto/create-order-detail.dto";

const router = express.Router();

router.post(
  "/create-order-detail",
  validateSchema(createOrderDetailDto),
  createOrderDetailController
);

export default router;
