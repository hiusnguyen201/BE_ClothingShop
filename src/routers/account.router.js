import express from 'express';
const router = express.Router();
import {
  getProfileController,
  editProfileController,
  changePasswordController,
  // createOrderCustomerController,
  getListPermissionsInUserController,
} from '#src/app/account/account.controller';
import { isAuthorized, isAuthorizedAndIsUser } from '#src/middlewares/jwt-auth.middleware';
import { UploadUtils } from '#src/utils/upload.util';

router
  .get('/view-profile', isAuthorized, getProfileController)
  .put('/edit-profile', isAuthorized, UploadUtils.single({ field: 'avatar' }), editProfileController)
  .post('/change-password', isAuthorized, changePasswordController)
  .get('/permissions', isAuthorizedAndIsUser, getListPermissionsInUserController);

export default router;
