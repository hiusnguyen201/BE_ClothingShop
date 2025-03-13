import express from 'express';
const router = express.Router();

import {
  createVoucherController,
  getAllVouchersController,
  getVoucherByIdController,
  updateVoucherByIdController,
  removeVoucherByIdController,
  isExistVoucherCodeController,
} from '#src/app/v1/vouchers/vouchers.controller';
import { validateBody } from '#core/validations/request.validation';
import { createVoucherDto } from '#src/app/v1/vouchers/dtos/create-voucher.dto';
import { updateVoucherDto } from '#src/app/v1/vouchers/dtos/update-voucher.dto';
import { isExistVoucherCodeDto } from '#src/app/v1/vouchers/dtos/is-exist-voucher-code.dto';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.post('/is-exist-voucher-code', validateBody(isExistVoucherCodeDto), isExistVoucherCodeController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-vouchers', getAllVouchersController)
  .get('/get-voucher-by-id/:id', getVoucherByIdController)
  .post('/create-voucher', validateBody(createVoucherDto), createVoucherController)
  .patch('/update-voucher-by-id/:id', validateBody(updateVoucherDto), updateVoucherByIdController)
  .delete('/remove-voucher-by-id/:id', removeVoucherByIdController);

export default router;
