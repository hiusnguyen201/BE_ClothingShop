import express from 'express';
const router = express.Router();

import {
  registerController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  sendOtpViaEmailController,
} from '#src/app/v1/auth/auth.controller';
import { validateBody } from '#src/core/validations/request.validation';
import { RegisterDto } from '#src/app/v1/auth/dtos/register.dto';
import { LoginDto } from '#src/app/v1/auth/dtos/login.dto';
import { VerifyOtpDto, SendOtpViaEmailDto } from '#src/app/v1/auth/dtos/two-factor.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '#src/app/v1/auth/dtos/forgot-password.dto';

router
  .post('/login', validateBody(LoginDto), loginController)
  .post('/register', validateBody(RegisterDto), registerController)
  .post('/forgot-password', validateBody(ForgotPasswordDto), forgotPasswordController)
  .post('/reset-password/:token', validateBody(ResetPasswordDto), resetPasswordController)
  .post('/send-otp-via-email', validateBody(SendOtpViaEmailDto), sendOtpViaEmailController)
  .post('/verify-otp', validateBody(VerifyOtpDto), verifyOtpController);

export default router;
