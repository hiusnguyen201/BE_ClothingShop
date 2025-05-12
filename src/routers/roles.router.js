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
  exportRolesController,
} from '#src/app/roles/roles.controller';
import { isAuthorized, can } from '#src/middlewares/jwt-auth.middleware';
import { EXPORT_PERMISSIONS, ROLES_PERMISSIONS } from '#src/database/data/permissions-data';

router.post('/is-exist-role-name', isExistRoleNameController);

router
  .post('/create-role', isAuthorized, can([ROLES_PERMISSIONS.CREATE_ROLE.name]), createRoleController)
  .get('/get-roles', isAuthorized, can([ROLES_PERMISSIONS.GET_ROLES.name]), getAllRolesController)
  .get('/export-excel', isAuthorized, can([EXPORT_PERMISSIONS.ROLE_EXCEL.name]), exportRolesController)
  .get('/get-role-by-id/:roleId', isAuthorized, can([ROLES_PERMISSIONS.GET_ROLE_DETAILS.name]), getRoleByIdController)
  .put('/update-role-by-id/:roleId', isAuthorized, can([ROLES_PERMISSIONS.EDIT_ROLE.name]), updateRoleByIdController)
  .delete(
    '/remove-role-by-id/:roleId',
    isAuthorized,
    can([ROLES_PERMISSIONS.REMOVE_ROLE.name]),
    removeRoleByIdController,
  )
  .get(
    '/:roleId/assigned-permissions',
    isAuthorized,
    can([ROLES_PERMISSIONS.GET_ASSIGNED_ROLE_PERMISSIONS.name]),
    getAssignedRolePermissionsController,
  )
  .get(
    '/:roleId/unassigned-permissions',
    isAuthorized,
    can([ROLES_PERMISSIONS.GET_UNASSIGNED_ROLE_PERMISSIONS.name]),
    getUnassignedRolePermissionsController,
  )
  .patch(
    '/:roleId/permissions',
    isAuthorized,
    can([ROLES_PERMISSIONS.ADD_ROLE_PERMISSIONS.name]),
    addRolePermissionsController,
  )
  .delete(
    '/:roleId/permissions/:permissionId',
    isAuthorized,
    can([ROLES_PERMISSIONS.REMOVE_ROLE_PERMISSIONS.name]),
    removeRolePermissionController,
  );

export default router;
