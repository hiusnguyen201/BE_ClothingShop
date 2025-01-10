import express from "express";
const router = express.Router();

import {
  // createPermissionController,
  getAllPermissionsController,
  getPermissionByIdController,
  updatePermissionByIdController,
  removePermissionByIdController,
  isExistPermissionNameController,
  activatePermissionByIdController,
  deactivatePermissionByIdController,
} from "#src/modules/permissions/permissions.controller";
// import { createPermissionDto } from "#src/modules/permissions/dto/create-permission.dto";
import { updatePermissionDto } from "#src/modules/permissions/dto/update-permission.dto";
import { checkExistPermissionNameDto } from "#src/modules/permissions/dto/check-exist-permission-name.dto";
import { validateSchema } from "#src/middlewares/validate-request.middleware";
// import {
//   hasPermission,
//   isAuthorized,
// } from "#src/middlewares/jwt-auth.middleware";

router.post(
  "/is-exist-permission-name",
  validateSchema(checkExistPermissionNameDto),
  isExistPermissionNameController
);

// router.use([isAuthorized, hasPermission]);
router
  .get("/get-permissions", getAllPermissionsController)
  .get("/get-permission-by-id/:id", getPermissionByIdController)
  // .post(
  //   "/create-permission",
  //   validateSchema(createPermissionDto),
  //   createPermissionController
  // )
  .patch(
    "/update-permission-by-id/:id",
    validateSchema(updatePermissionDto),
    updatePermissionByIdController
  )
  .delete("/remove-permission-by-id/:id", removePermissionByIdController)
  .patch(
    "/activate-permission-by-id/:id",
    activatePermissionByIdController
  )
  .patch(
    "/deactivate-permission-by-id/:id",
    deactivatePermissionByIdController
  );

export default router;
