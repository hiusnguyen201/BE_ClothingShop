import express from 'express';
const router = express.Router();
import { validateBody } from '#src/core/validations/request.validation';
import {
  getProfileController,
  editProfileController,
  changePasswordController,
  // createOrderCustomerController,
} from '#src/app/account/account.controller';

import { isAuthorized } from '#src/middlewares/jwt-auth.middleware';
import { EditProfileDto } from '#src/app/account/dtos/edit-profile.dto';
import { ChangePasswordDto } from '#src/app/account/dtos/change-password.dto';

router
  .get('/view-profile', isAuthorized, getProfileController)
  .put('/edit-profile', isAuthorized, validateBody(EditProfileDto), editProfileController)
  .post('/change-password', isAuthorized, validateBody(ChangePasswordDto), changePasswordController);

export default router;
