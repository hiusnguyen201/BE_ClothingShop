import express from "express";
const router = express.Router();
import { validateSchema } from "#src/middlewares/validate-request.middleware";
import {
  claimVoucherByCodeController,
  getAllVoucherFromCustomerController,
} from "#src/modules/account/account.controller";

import { claimVoucherByCodeDto } from "#src/modules/account/dto/claim-voucher-by-code.dto";
import { isAuthorized } from "#src/middlewares/jwt-auth.middleware";

router.use([isAuthorized]);
router
  .post(
    "/claim-voucher-by-code",
    validateSchema(claimVoucherByCodeDto),
    claimVoucherByCodeController
  )
  .get("/get-vouchers-from-customer", getAllVoucherFromCustomerController);

export default router;
