import express from "express";
const router = express.Router();

import {
  registerController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  sendOtpViaEmailController,
} from "#src/modules/auth/auth.controller";
import {
  validateFile,
  validateSchema,
} from "#src/middlewares/validate-request.middleware";
import { registerDto } from "#src/modules/auth/dto/register.dto";
import { loginDto } from "#src/modules/auth/dto/login.dto";
import {
  verifyOtpDto,
  sendOtpViaEmailDto,
} from "#src/modules/auth/dto/two-factor.dto";
import {
  forgotPasswordDto,
  resetPasswordDto,
} from "#src/modules/auth/dto/forgot-password.dto";
import { UploadUtils } from "#src/utils/upload.util";
import { ALLOW_IMAGE_MIME_TYPES } from "#src/core/constant";
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router
  .post(
    "/register",
    validateFile(upload.single("avatar")),
    validateSchema(registerDto),
    registerController
  )
  .post("/login", validateSchema(loginDto), loginController)
  .post(
    "/send-otp-via-email",
    validateSchema(sendOtpViaEmailDto),
    sendOtpViaEmailController
  )
  .post("/verify-otp", validateSchema(verifyOtpDto), verifyOtpController)
  .post(
    "/forgot-password",
    validateSchema(forgotPasswordDto),
    forgotPasswordController
  )
  .post(
    "/reset-password/:token",
    validateSchema(resetPasswordDto),
    resetPasswordController
  );

export default router;
