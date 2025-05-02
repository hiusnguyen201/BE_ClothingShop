import express from 'express';
const router = express.Router();
import {
  getProfileController,
  editProfileController,
  changePasswordController,
  getListPermissionsInUserController,
  getListNotificationInUserController,
  markAsReadNotificationInUserController,
  markAllAsReadNotificationInUserController,
} from '#src/app/account/account.controller';
import { isAuthorized, isAuthorizedAndIsUser } from '#src/middlewares/jwt-auth.middleware';
import { UploadUtils } from '#src/utils/upload.util';

router
  .get('/view-profile', isAuthorized, getProfileController)
  .put('/edit-profile', isAuthorized, UploadUtils.single({ field: 'avatar' }), editProfileController)
  .post('/change-password', isAuthorized, changePasswordController)
  .get('/permissions', isAuthorizedAndIsUser, getListPermissionsInUserController)
  .get('/notifications', isAuthorizedAndIsUser, getListNotificationInUserController)
  .put('/notifications/:userNotificationId/mark-as-read', isAuthorizedAndIsUser, markAsReadNotificationInUserController)
  .post('/notifications/mark-all-as-read', isAuthorizedAndIsUser, markAllAsReadNotificationInUserController);

export default router;
