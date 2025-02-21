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
} from '#app/permissions/permissions.controller';
import { updatePermissionDto } from '#app/permissions/dto/update-permission.dto';
import { checkExistPermissionNameDto } from '#app/permissions/dto/check-exist-permission-name.dto';
import { validateSchema } from '#middlewares/validate-request.middleware';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.post('/is-exist-permission-name', validateSchema(checkExistPermissionNameDto), isExistPermissionNameController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-permissions', getAllPermissionsController)
  .get('/get-permission-by-id/:id', getPermissionByIdController)
  .patch('/update-permission-by-id/:id', validateSchema(updatePermissionDto), updatePermissionByIdController)
  .delete('/remove-permission-by-id/:id', removePermissionByIdController)
  .patch('/activate-permission-by-id/:id', activatePermissionByIdController)
  .patch('/deactivate-permission-by-id/:id', deactivatePermissionByIdController);

export default router;
