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
import { validateBody } from '#src/core/validations/request.validation';
import { CreateVoucherDto } from '#src/app/v1/vouchers/dtos/create-voucher.dto';
import { UpdateVoucherDto } from '#src/app/v1/vouchers/dtos/update-voucher.dto';
import { CheckExistVoucherCodeDto } from '#src/app/v1/vouchers/dtos/check-exist-voucher-code.dto';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.post('/is-exist-voucher-code', validateBody(CheckExistVoucherCodeDto), isExistVoucherCodeController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-vouchers', getAllVouchersController)
  .get('/get-voucher-by-id/:id', getVoucherByIdController)
  .post('/create-voucher', validateBody(CreateVoucherDto), createVoucherController)
  .patch('/update-voucher-by-id/:id', validateBody(UpdateVoucherDto), updateVoucherByIdController)
  .delete('/remove-voucher-by-id/:id', removeVoucherByIdController);

export default router;
