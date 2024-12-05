import express from "express";
const router = express.Router();

import {
    createRoleController,
    getAllRolesController,
    getRoleByIdController,
    updateRoleByIdController,
    removeRoleByIdController,
} from "#src/modules/roles/roles.controller";
import { createRoleDto } from "#src/modules/roles/dto/create-role.dto";
import {
    validateSchema,
    validateFile,
} from "#src/middlewares/validate-request.middleware";
import { UploadUtils } from "#src/utils/upload.util";
import { ALLOW_IMAGE_ICON_MIME_TYPES } from "#src/core/constant";
const upload = UploadUtils.config({
    allowedMimeTypes: ALLOW_IMAGE_ICON_MIME_TYPES,
});

router
    .get("/get-roles", getAllRolesController)
    .get("/get-role-by-id/:id", getRoleByIdController)
    .post(
        "/create-role",
        validateFile(upload.single("icon")),
        validateSchema(createRoleDto),
        createRoleController
    )
    .patch("/update-role-by-id/:id",
        validateFile(upload.single("icon")),
        validateSchema(createRoleDto),
        updateRoleByIdController)
    .delete("/remove-role-by-id/:id", removeRoleByIdController);

export default router;
