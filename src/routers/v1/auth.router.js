import express from 'express';
const router = express.Router();

import {
  registerController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  sendOtpViaEmailController,
} from '#app/auth/auth.controller';
import { validateFile, validateSchema } from '#middlewares/validate-request.middleware';
import { registerDto } from '#app/auth/dto/register.dto';
import { loginDto } from '#app/auth/dto/login.dto';
import { verifyOtpDto, sendOtpViaEmailDto } from '#app/auth/dto/two-factor.dto';
import { forgotPasswordDto, resetPasswordDto } from '#app/auth/dto/forgot-password.dto';
import { UploadUtils } from '#utils/upload.util';
import { ALLOW_IMAGE_MIME_TYPES } from '#core/constant';
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router
  .post('/register', validateFile(upload.single('avatar')), validateSchema(registerDto), registerController)
  .post('/login', validateSchema(loginDto), loginController)
  .post('/send-otp-via-email', validateSchema(sendOtpViaEmailDto), sendOtpViaEmailController)
  .post('/verify-otp', validateSchema(verifyOtpDto), verifyOtpController)
  .post('/forgot-password', validateSchema(forgotPasswordDto), forgotPasswordController)
  .post('/reset-password/:token', validateSchema(resetPasswordDto), resetPasswordController);

export default router;
