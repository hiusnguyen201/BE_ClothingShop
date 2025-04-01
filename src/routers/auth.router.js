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
import { validateBody } from '#src/core/validations/request.validation';
import { RegisterDto } from '#src/app/auth/dtos/register.dto';
import { LoginDto } from '#src/app/auth/dtos/login.dto';
import { VerifyOtpDto, SendOtpViaEmailDto } from '#src/app/auth/dtos/two-factor.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '#src/app/auth/dtos/forgot-password.dto';
import { isAuthorized } from '#src/middlewares/jwt-auth.middleware';

router
  .post('/logout', isAuthorized, logoutController)
  .post('/login', validateBody(LoginDto), loginCustomerController)
  .post('/login-admin', validateBody(LoginDto), loginAdminController)
  .post('/refresh-token', refreshTokenController)
  .post('/register', validateBody(RegisterDto), registerController)
  .post('/forgot-password', validateBody(ForgotPasswordDto), forgotPasswordController)
  .post('/reset-password/:token', validateBody(ResetPasswordDto), resetPasswordController)
  .post('/send-otp-via-email', validateBody(SendOtpViaEmailDto), sendOtpViaEmailController)
  .post('/verify-otp', validateBody(VerifyOtpDto), verifyOtpController);

export default router;
