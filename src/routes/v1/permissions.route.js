import express from "express";
const router = express.Router();

import {
  createPermissionController,
  getAllPermissionsController,
  getPermissionByIdController,
  updatePermissionByIdController,
  removePermissionByIdController,
} from "#src/modules/permissions/permissions.controller";
import { createPermissionDto } from "#src/modules/permissions/dto/create-permission.dto";
import { updatePermissionDto } from "#src/modules/permissions/dto/update-permission.dto";
import { validateSchema } from "#src/middlewares/validate-request.middleware";

router
  .get("/get-permissions", getAllPermissionsController)
  .get("/get-permission-by-id/:id", getPermissionByIdController)
  .post(
    "/create-permission",
    validateSchema(createPermissionDto),
    createPermissionController
  )
  .patch(
    "/update-permission-by-id/:id",
    validateSchema(updatePermissionDto),
    updatePermissionByIdController
  )
  .delete("/remove-permission-by-id/:id", removePermissionByIdController);

export default router;
