import express from "express";
const router = express.Router();

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  removeUserByIdController,
  isExistEmailController,
} from "#src/modules/users/users.controller";
import { createUserDto } from "#src/modules/users/dto/create-user.dto";
import { updateUserDto } from "#src/modules/users/dto/update-user.dto";
import {
  validateSchema,
  validateFile,
} from "#src/middlewares/validate-request.middleware";
import { UploadUtils } from "#src/utils/upload.util";
import { ALLOW_IMAGE_MIME_TYPES } from "#src/core/constant";
import { checkExistEmailDto } from "#src/modules/users/dto/check-exist-email.dto";
import {
  hasPermission,
  isAuthorized,
} from "#src/middlewares/jwt-auth.middleware";

const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router.post(
  "/is-exist-email",
  validateSchema(checkExistEmailDto),
  isExistEmailController
);

router
  .get("/get-users", [isAuthorized, hasPermission], getAllUsersController)
  .get(
    "/get-user-by-id/:id",
    [isAuthorized, hasPermission],
    getUserByIdController
  )
  .post(
    "/create-user",
    [isAuthorized, hasPermission],
    validateFile(upload.single("avatar")),
    validateSchema(createUserDto),
    createUserController
  )
  .patch(
    "/update-user-by-id/:id",
    [isAuthorized, hasPermission],
    validateFile(upload.single("avatar")),
    validateSchema(updateUserDto),
    updateUserByIdController
  )
  .delete(
    "/remove-user-by-id/:id",
    [isAuthorized, hasPermission],
    removeUserByIdController
  );

export default router;
