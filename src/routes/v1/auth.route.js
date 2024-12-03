import express from "express";
const router = express.Router();

import {
  registerController,
  loginController,
  forgotPasswordController,
  resetPasswordController
} from "#src/modules/auth/auth.controller";
import { validateSchema } from "#src/middlewares/validate-request.middleware";
import { registerDto } from "#src/modules/auth/dto/register.dto";
import { loginDto } from "#src/modules/auth/dto/login.dto";
import { forgotPasswordDto, resetPasswordDto } from "#src/modules/auth/dto/forgotPassword.dto";
router
  .post(
    "/register",
    validateSchema(registerDto),
    //đi vào 1 hàm trong controller
    registerController
  )
  .post(
    "/login",
    validateSchema(loginDto),
    //đi vào 1 hàm trong controller
    loginController
  )
  .post(
    "/forgot-password",
    validateSchema(forgotPasswordDto),
    //đi vào 1 hàm trong controller
    forgotPasswordController
  )
  .post(
    "/reset-password/:token",
    validateSchema(resetPasswordDto),
    //đi vào 1 hàm trong controller
    resetPasswordController
  )

export default router;
