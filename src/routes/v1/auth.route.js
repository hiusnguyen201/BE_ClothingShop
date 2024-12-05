import express from "express";
const router = express.Router();

import {
  registerController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  sendOtpViaEmailController
} from "#src/modules/auth/auth.controller";
import { validateSchema } from "#src/middlewares/validate-request.middleware";
import { registerDto } from "#src/modules/auth/dto/register.dto";
import { loginDto } from "#src/modules/auth/dto/login.dto";
import { verifyOtpDto } from "#src/modules/auth/dto/code-verify-email.dto";
import { forgotPasswordDto, resetPasswordDto } from "#src/modules/auth/dto/forgotPassword.dto";
import { sendOtpViaEmailDto } from "#src/modules/auth/dto/send-otp-via-email.dto";
router
  .post(
    "/register",
    validateSchema(registerDto),
    registerController
  )
  .post(
    "/login",
    validateSchema(loginDto),
    loginController
  )
  .post(
    "/send-otp-via-email",
    validateSchema(sendOtpViaEmailDto),
    sendOtpViaEmailController
  )
  .post(
    "/verify-otp",
    validateSchema(verifyOtpDto),
    verifyOtpController
  )
  .post(
    "/forgot-password",
    validateSchema(forgotPasswordDto),
    forgotPasswordController
  )
  .post(
    "/reset-password/:token",
    validateSchema(resetPasswordDto),
    resetPasswordController
  )

export default router;
