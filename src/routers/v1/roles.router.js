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
import { validateBody } from '#src/core/validations/request.validation';
import { CheckExistRoleNameDto } from '#src/app/v1/roles/dtos/check-exist-role-name.dto';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.post('/is-exist-role-name', validateBody(CheckExistRoleNameDto), isExistRoleNameController);

router
  .post('/create-role', isAuthorizedAndHasPermission, validateBody(CreateRoleDto), createRoleController)
  .get('/get-roles', isAuthorizedAndHasPermission, getAllRolesController)
  .get('/get-role-by-id/:id', isAuthorizedAndHasPermission, getRoleByIdController)
  .patch('/update-role-by-id/:id', isAuthorizedAndHasPermission, validateBody(UpdateRoleDto), updateRoleByIdController)
  .delete('/remove-role-by-id/:id', isAuthorizedAndHasPermission, removeRoleByIdController)
  .patch('/activate-role-by-id/:id', isAuthorizedAndHasPermission, activateRoleByIdController)
  .patch('/deactivate-role-by-id/:id', isAuthorizedAndHasPermission, deactivateRoleByIdController);

export default router;
