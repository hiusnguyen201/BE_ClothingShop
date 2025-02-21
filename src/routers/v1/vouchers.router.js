import express from 'express';
const router = express.Router();

import {
  createVoucherController,
  getAllVouchersController,
  getVoucherByIdController,
  updateVoucherByIdController,
  removeVoucherByIdController,
  isExistVoucherCodeController,
} from '#app/vouchers/vouchers.controller';
import { validateSchema } from '#middlewares/validate-request.middleware';
import { createVoucherDto } from '#app/vouchers/dto/create-voucher.dto';
import { updateVoucherDto } from '#app/vouchers/dto/update-voucher.dto';
import { isExistVoucherCodeDto } from '#app/vouchers/dto/is-exist-voucher-code.dto';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.post('/is-exist-voucher-code', validateSchema(isExistVoucherCodeDto), isExistVoucherCodeController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-vouchers', getAllVouchersController)
  .get('/get-voucher-by-id/:id', getVoucherByIdController)
  .post('/create-voucher', validateSchema(createVoucherDto), createVoucherController)
  .patch('/update-voucher-by-id/:id', validateSchema(updateVoucherDto), updateVoucherByIdController)
  .delete('/remove-voucher-by-id/:id', removeVoucherByIdController);

export default router;
