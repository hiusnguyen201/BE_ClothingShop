import express from 'express';
const router = express.Router();
import {
  getProfileController,
  editProfileController,
  changePasswordController,
  // createOrderCustomerController,
} from '#src/app/account/account.controller';
import { isAuthorized } from '#src/middlewares/jwt-auth.middleware';

router
  .get('/view-profile', isAuthorized, getProfileController)
  .put('/edit-profile', isAuthorized, editProfileController)
  .post('/change-password', isAuthorized, changePasswordController);

export default router;
