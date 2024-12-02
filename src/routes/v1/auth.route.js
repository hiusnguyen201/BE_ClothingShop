import express from "express";
const router = express.Router();

import {
  registerController,
  loginController,
} from "#src/modules/auth/auth.controller";
import {
  validateFile,
  validateSchema,
} from "#src/middlewares/validate-request.middleware";
import { registerDto } from "#src/modules/auth/dto/register.dto";
import { loginDto } from "#src/modules/auth/dto/login.dto";
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
  .post("/login", validateSchema(loginDto), loginController);

export default router;
