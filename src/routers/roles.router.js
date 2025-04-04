import express from 'express';
const router = express.Router();

import {
  createRoleController,
  getAllRolesController,
  getRoleByIdController,
  updateRoleByIdController,
  removeRoleByIdController,
  isExistRoleNameController,
  getRolePermissionsController,
  addRolePermissionsController,
  removeRolePermissionController,
} from '#src/app/roles/roles.controller';
import { CreateRoleDto } from '#src/app/roles/dtos/create-role.dto';
import { UpdateRoleDto } from '#src/app/roles/dtos/update-role.dto';
import { validateBody, validateParams, validateQuery } from '#src/core/validations/request.validation';
import { CheckExistRoleNameDto } from '#src/app/roles/dtos/check-exist-role-name.dto';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { GetListRoleDto } from '#src/app/roles/dtos/get-list-role.dto';
import { GetRolePermissionsDto } from '#src/app/roles/dtos/get-role-permissions.dto';
import { RemoveRolePermissionDto } from '#src/app/roles/dtos/remove-role-permission.dto';
import { AddRolePermissionsDto } from '#src/app/roles/dtos/add-role-permissions.dto';

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
  .get(
    '/:roleId/permissions',
    isAuthorizedAndHasPermission,
    validateQuery(GetRolePermissionsDto),
    getRolePermissionsController,
  )
  .patch(
    '/:roleId/permissions',
    isAuthorizedAndHasPermission,
    validateBody(AddRolePermissionsDto),
    addRolePermissionsController,
  )
  .delete(
    '/:roleId/permissions/:permissionId',
    isAuthorizedAndHasPermission,
    validateParams(RemoveRolePermissionDto),
    removeRolePermissionController,
  );

export default router;
