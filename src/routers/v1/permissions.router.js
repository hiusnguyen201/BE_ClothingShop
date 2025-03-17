import express from 'express';
const router = express.Router();

import {
  getAllPermissionsController,
  getPermissionByIdController,
  updatePermissionByIdController,
  isExistPermissionNameController,
  activatePermissionByIdController,
  deactivatePermissionByIdController,
} from '#src/app/v1/permissions/permissions.controller';
import { UpdatePermissionDto } from '#src/app/v1/permissions/dtos/update-permission.dto';
import { CheckExistPermissionNameDto } from '#src/app/v1/permissions/dtos/check-exist-permission-name.dto';
import { validateBody } from '#src/core/validations/request.validation';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.post('/is-exist-permission-name', validateBody(CheckExistPermissionNameDto), isExistPermissionNameController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-permissions', getAllPermissionsController)
  .get('/get-permission-by-id/:permissionId', getPermissionByIdController)
  .put('/update-permission-by-id/:permissionId', validateBody(UpdatePermissionDto), updatePermissionByIdController)
  .patch('/activate-permission-by-id/:permissionId', activatePermissionByIdController)
  .patch('/deactivate-permission-by-id/:permissionId', deactivatePermissionByIdController);

export default router;
