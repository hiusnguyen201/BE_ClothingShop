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
} from '#src/app/v1/roles/roles.controller';
import { CreateRoleDto } from '#src/app/v1/roles/dtos/create-role.dto';
import { UpdateRoleDto } from '#src/app/v1/roles/dtos/update-role.dto';
import { validateBody, validateQuery } from '#src/core/validations/request.validation';
import { CheckExistRoleNameDto } from '#src/app/v1/roles/dtos/check-exist-role-name.dto';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { GetListRoleDto } from '#src/app/v1/roles/dtos/get-list-role.dto';

router.post('/is-exist-role-name', validateBody(CheckExistRoleNameDto), isExistRoleNameController);

router
  .post('/create-role', isAuthorizedAndHasPermission, validateBody(CreateRoleDto), createRoleController)
  .get('/get-roles', isAuthorizedAndHasPermission, validateQuery(GetListRoleDto), getAllRolesController)
  .get('/get-role-by-id/:roleId', isAuthorizedAndHasPermission, getRoleByIdController)
  .put(
    '/update-role-by-id/:roleId',
    isAuthorizedAndHasPermission,
    validateBody(UpdateRoleDto),
    updateRoleByIdController,
  )
  .delete('/remove-role-by-id/:roleId', isAuthorizedAndHasPermission, removeRoleByIdController)
  .patch('/activate-role-by-id/:roleId', isAuthorizedAndHasPermission, activateRoleByIdController)
  .patch('/deactivate-role-by-id/:roleId', isAuthorizedAndHasPermission, deactivateRoleByIdController);

export default router;
