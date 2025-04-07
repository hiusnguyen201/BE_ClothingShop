import express from 'express';
const router = express.Router();

import {
  createRoleController,
  getAllRolesController,
  getRoleByIdController,
  updateRoleByIdController,
  removeRoleByIdController,
  isExistRoleNameController,
  getAssignedRolePermissionsController,
  addRolePermissionsController,
  removeRolePermissionController,
  getUnassignedRolePermissionsController,
} from '#src/app/roles/roles.controller';
import { CreateRoleDto } from '#src/app/roles/dtos/create-role.dto';
import { UpdateRoleDto } from '#src/app/roles/dtos/update-role.dto';
import { validateBody, validateParams, validateQuery } from '#src/core/validations/request.validation';
import { CheckExistRoleNameDto } from '#src/app/roles/dtos/check-exist-role-name.dto';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { GetListRoleDto } from '#src/app/roles/dtos/get-list-role.dto';
import { GetAssignedRolePermissionsDto } from '#src/app/roles/dtos/get-assigned-role-permissions.dto';
import { RemoveRolePermissionDto } from '#src/app/roles/dtos/remove-role-permission.dto';
import { AddRolePermissionsDto } from '#src/app/roles/dtos/add-role-permissions.dto';
import { GetUnassignedRolePermissionsDto } from '#src/app/roles/dtos/get-unassigned-role-permissions.dto';
import { GetRoleDto } from '#src/app/roles/dtos/get-role.dto';

router.post('/is-exist-role-name', validateBody(CheckExistRoleNameDto), isExistRoleNameController);

router
  .post('/create-role', isAuthorizedAndHasPermission, validateBody(CreateRoleDto), createRoleController)
  .get('/get-roles', isAuthorizedAndHasPermission, validateQuery(GetListRoleDto), getAllRolesController)
  .get('/get-role-by-id/:roleId', isAuthorizedAndHasPermission, validateParams(GetRoleDto), getRoleByIdController)
  .put(
    '/update-role-by-id/:roleId',
    isAuthorizedAndHasPermission,
    validateParams(GetRoleDto),
    validateBody(UpdateRoleDto),
    updateRoleByIdController,
  )
  .delete(
    '/remove-role-by-id/:roleId',
    isAuthorizedAndHasPermission,
    validateParams(GetRoleDto),
    removeRoleByIdController,
  )
  .get(
    '/:roleId/assigned-permissions',
    isAuthorizedAndHasPermission,
    validateParams(GetRoleDto),
    validateQuery(GetAssignedRolePermissionsDto),
    getAssignedRolePermissionsController,
  )
  .get(
    '/:roleId/unassigned-permissions',
    isAuthorizedAndHasPermission,
    validateParams(GetRoleDto),
    validateQuery(GetUnassignedRolePermissionsDto),
    getUnassignedRolePermissionsController,
  )
  .patch(
    '/:roleId/permissions',
    isAuthorizedAndHasPermission,
    validateParams(GetRoleDto),
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
