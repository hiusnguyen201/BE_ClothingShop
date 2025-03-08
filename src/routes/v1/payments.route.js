import express from "express";

import { validateSchema } from "#src/middlewares/validate-request.middleware";
import {
  createPaymentController,
  returnPaymentMomoController,
  returnPaymentVnPayController,
} from "#src/modules/payments/payments.controller";
import { createPaymentDto } from "#src/modules/payments/dto/create-payments.dto";

const router = express.Router();

router.post(
  "/create-payment",
  validateSchema(createPaymentDto),
  createPaymentController
);

router.get("/return-payment-momo", returnPaymentMomoController);
router.get("/return-payment-vnpay", returnPaymentVnPayController);
export default router;
