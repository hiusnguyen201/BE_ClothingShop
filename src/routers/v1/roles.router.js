import express from 'express';
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
} from '#app/roles/roles.controller';
import { createRoleDto } from '#app/roles/dto/create-role.dto';
import { updateRoleDto } from '#app/roles/dto/update-role.dto';
import { validateSchema, validateFile } from '#middlewares/validate-request.middleware';
import { UploadUtils } from '#utils/upload.util';
import { ALLOW_ICON_MIME_TYPES } from '#core/constant';
import { checkExistRoleNameDto } from '#app/roles/dto/check-exist-role-name.dto';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_ICON_MIME_TYPES,
});

router.post('/is-exist-role-name', validateSchema(checkExistRoleNameDto), isExistRoleNameController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-roles', getAllRolesController)
  .get('/get-role-by-id/:id', getRoleByIdController)
  .post('/create-role', validateFile(upload.single('icon')), validateSchema(createRoleDto), createRoleController)
  .patch(
    '/update-role-by-id/:id',
    validateFile(upload.single('icon')),
    validateSchema(updateRoleDto),
    updateRoleByIdController,
  )
  .delete('/remove-role-by-id/:id', removeRoleByIdController)
  .patch('/activate-role-by-id/:id', activateRoleByIdController)
  .patch('/deactivate-role-by-id/:id', deactivateRoleByIdController);

export default router;
