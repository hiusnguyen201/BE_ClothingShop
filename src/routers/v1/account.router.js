import express from 'express';
const router = express.Router();
import { validateBody } from '#core/validations/request.validation';
import {
  claimVoucherByCodeController,
  getAllVoucherFromCustomerController,
} from '#src/app/v1/account/account.controller';

import { claimVoucherByCodeDto } from '#src/app/v1/account/dtos/claim-voucher-by-code.dto';
import { isAuthorized } from '#middlewares/jwt-auth.middleware';

router.use([isAuthorized]);
router
  .post('/claim-voucher-by-code', validateBody(claimVoucherByCodeDto), claimVoucherByCodeController)
  .get('/get-vouchers-from-customer', getAllVoucherFromCustomerController);

export default router;
