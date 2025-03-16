import express from 'express';
const router = express.Router();
import { validateBody } from '#src/core/validations/request.validation';
import {
  claimVoucherByCodeController,
  getAllVoucherFromCustomerController,
  getProfileController,
  editProfileController,
  changePasswordController,
} from '#src/app/v1/account/account.controller';

import { ClaimVoucherByCodeDto } from '#src/app/v1/account/dtos/claim-voucher-by-code.dto';
import { isAuthorized, isAuthorizedAndIsCustomer } from '#src/middlewares/jwt-auth.middleware';
import { EditProfileDto } from '#src/app/v1/account/dtos/edit-profile.dto';
import { ChangePasswordDto } from '#src/app/v1/account/dtos/change-password.dto';

router
  .get('/profile', isAuthorized, getProfileController)
  .put('/edit-profile', isAuthorized, validateBody(EditProfileDto), editProfileController)
  .post('/change-password', isAuthorized, validateBody(ChangePasswordDto), changePasswordController)
  .post(
    '/claim-voucher-by-code',
    isAuthorizedAndIsCustomer,
    validateBody(ClaimVoucherByCodeDto),
    claimVoucherByCodeController,
  )
  .get('/get-vouchers-from-customer', isAuthorizedAndIsCustomer, getAllVoucherFromCustomerController);

export default router;
