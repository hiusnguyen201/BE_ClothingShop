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
import { validateFile, validateBody } from '#src/core/validations/request.validation';
import { RegisterDto } from '#src/app/v1/auth/dtos/register.dto';
import { LoginDto } from '#src/app/v1/auth/dtos/login.dto';
import { VerifyOtpDto, SendOtpViaEmailDto } from '#src/app/v1/auth/dtos/two-factor.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '#src/app/v1/auth/dtos/forgot-password.dto';
import { UploadUtils } from '#src/utils/upload.util';
import { ALLOW_IMAGE_MIME_TYPES } from '#src/core/constant';
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router
  .post('/login', validateBody(LoginDto), loginController)
  .post('/register', validateFile(upload.single('avatar')), validateBody(RegisterDto), registerController)
  .post('/send-otp-via-email', validateBody(SendOtpViaEmailDto), sendOtpViaEmailController)
  .post('/verify-otp', validateBody(VerifyOtpDto), verifyOtpController)
  .post('/forgot-password', validateBody(ForgotPasswordDto), forgotPasswordController)
  .post('/reset-password/:token', validateBody(ResetPasswordDto), resetPasswordController);

export default router;
