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
import { validateFile, validateBody } from '#core/validations/request.validation';
import { registerDto } from '#src/app/v1/auth/dtos/register.dto';
import { loginDto } from '#src/app/v1/auth/dtos/login.dto';
import { verifyOtpDto, sendOtpViaEmailDto } from '#src/app/v1/auth/dtos/two-factor.dto';
import { forgotPasswordDto, resetPasswordDto } from '#src/app/v1/auth/dtos/forgot-password.dto';
import { UploadUtils } from '#utils/upload.util';
import { ALLOW_IMAGE_MIME_TYPES } from '#core/constant';
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router
  .post('/login', validateBody(loginDto), loginController)
  .post('/register', validateFile(upload.single('avatar')), validateBody(registerDto), registerController)
  .post('/send-otp-via-email', validateBody(sendOtpViaEmailDto), sendOtpViaEmailController)
  .post('/verify-otp', validateBody(verifyOtpDto), verifyOtpController)
  .post('/forgot-password', validateBody(forgotPasswordDto), forgotPasswordController)
  .post('/reset-password/:token', validateBody(resetPasswordDto), resetPasswordController);

export default router;
