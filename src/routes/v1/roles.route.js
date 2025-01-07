import express from "express";
const router = express.Router();

import {
  createRoleController,
  getAllRolesController,
  getRoleByIdController,
  updateRoleByIdController,
  removeRoleByIdController,
  isExistRoleNameController,
  activateRoleByIdController,
  deactivateRoleByIdController,
} from "#src/modules/roles/roles.controller";
import { createRoleDto } from "#src/modules/roles/dto/create-role.dto";
import { updateRoleDto } from "#src/modules/roles/dto/update-role.dto";
import {
  validateSchema,
  validateFile,
} from "#src/middlewares/validate-request.middleware";
import { UploadUtils } from "#src/utils/upload.util";
import { ALLOW_ICON_MIME_TYPES } from "#src/core/constant";
import { checkExistRoleNameDto } from "#src/modules/roles/dto/check-exist-role-name.dto";
// import {
//   hasPermission,
//   isAuthorized,
// } from "#src/middlewares/jwt-auth.middleware";
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_ICON_MIME_TYPES,
});

router.post(
  "/is-exist-role-name",
  validateSchema(checkExistRoleNameDto),
  isExistRoleNameController
);

// router.use([isAuthorized, hasPermission]);
router
  .get("/get-roles", getAllRolesController)
  .get("/get-role-by-id/:id", getRoleByIdController)
  .post(
    "/create-role",
    validateFile(upload.single("icon")),
    validateSchema(createRoleDto),
    createRoleController
  )
  .patch(
    "/update-role-by-id/:id",
    validateFile(upload.single("icon")),
    validateSchema(updateRoleDto),
    updateRoleByIdController
  )
  .delete("/remove-role-by-id/:id", removeRoleByIdController)
  .patch("/activate-role-by-id/:id", activateRoleByIdController)
  .patch("/deactivate-role-by-id/:id", deactivateRoleByIdController);

export default router;
