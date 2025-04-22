import express from 'express';
const router = express.Router();

import {
  registerController,
  loginCustomerController,
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  sendOtpViaEmailController,
  logoutController,
  refreshTokenController,
  loginAdminController,
} from '#src/app/auth/auth.controller';
import { isAuthorized } from '#src/middlewares/jwt-auth.middleware';

router
  .post('/logout', isAuthorized, logoutController)
  .post('/refresh-token', refreshTokenController)
  .post('/login', loginCustomerController)
  .post('/login-admin', loginAdminController)
  .post('/register', registerController)
  .post('/forgot-password', forgotPasswordController)
  .post('/reset-password/:token', resetPasswordController)
  .post('/send-otp-via-email', sendOtpViaEmailController)
  .post('/verify-otp', verifyOtpController);

export default router;
