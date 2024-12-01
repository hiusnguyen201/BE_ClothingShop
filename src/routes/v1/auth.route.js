import express from "express";
const router = express.Router();

import { registerController } from "#src/modules/auth/auth.controller";
import { loginController } from "#src/modules/auth/auth.controller"
import { validateSchema } from "#src/middlewares/validate-request.middleware";
import { registerDto } from "#src/modules/auth/dto/register.dto"
import { loginDto } from "#src/modules/auth/dto/login.dto"
router
  .post("/register",
    validateSchema(registerDto),
    //đi vào 1 hàm trong controller
    registerController,
  )
  .post("/login",
    validateSchema(loginDto),
    //đi vào 1 hàm trong controller
    loginController,
  )


export default router;

