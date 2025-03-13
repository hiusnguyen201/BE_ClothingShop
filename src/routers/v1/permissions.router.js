import express from 'express';
const router = express.Router();

import {
  getAllPermissionsController,
  getPermissionByIdController,
  updatePermissionByIdController,
  removePermissionByIdController,
  isExistPermissionNameController,
  activatePermissionByIdController,
  deactivatePermissionByIdController,
} from '#src/app/v1/permissions/permissions.controller';
import { updatePermissionDto } from '#src/app/v1/permissions/dtos/update-permission.dto';
import { checkExistPermissionNameDto } from '#src/app/v1/permissions/dtos/check-exist-permission-name.dto';
import { validateBody } from '#core/validations/request.validation';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.post('/is-exist-permission-name', validateBody(checkExistPermissionNameDto), isExistPermissionNameController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-permissions', getAllPermissionsController)
  .get('/get-permission-by-id/:id', getPermissionByIdController)
  .patch('/update-permission-by-id/:id', validateBody(updatePermissionDto), updatePermissionByIdController)
  .delete('/remove-permission-by-id/:id', removePermissionByIdController)
  .patch('/activate-permission-by-id/:id', activatePermissionByIdController)
  .patch('/deactivate-permission-by-id/:id', deactivatePermissionByIdController);

export default router;
