import express from "express";
const router = express.Router();

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  removeUserByIdController,
} from "#src/modules/users/users.controller";
import { createUserDto } from "#src/modules/users/dto/create-user.dto";
import {
  validateSchema,
  validateFile,
} from "#src/middlewares/validate-request.middleware";
import { UploadUtils } from "#src/utils/upload.util";
import { ALLOW_IMAGE_MIME_TYPES } from "#src/core/constant";
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router
  .get("/get-users", getAllUsersController)
  .get("/get-user-by-id/:id", getUserByIdController)
  .post(
    "/create-user",
    validateSchema(createUserDto),
    validateFile(upload.single("image")),
    createUserController
  )
  .patch("/update-user-by-id/:id", updateUserByIdController)
  .delete("/remove-user-by-id/:id", removeUserByIdController);

export default router;
