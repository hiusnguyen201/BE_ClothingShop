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
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.post('/is-exist-role-name', isExistRoleNameController);

router
  .post('/create-role', isAuthorizedAndHasPermission, createRoleController)
  .get('/get-roles', isAuthorizedAndHasPermission, getAllRolesController)
  .get('/get-role-by-id/:roleId', isAuthorizedAndHasPermission, getRoleByIdController)
  .put('/update-role-by-id/:roleId', isAuthorizedAndHasPermission, updateRoleByIdController)
  .delete('/remove-role-by-id/:roleId', isAuthorizedAndHasPermission, removeRoleByIdController)
  .get('/:roleId/assigned-permissions', isAuthorizedAndHasPermission, getAssignedRolePermissionsController)
  .get('/:roleId/unassigned-permissions', isAuthorizedAndHasPermission, getUnassignedRolePermissionsController)
  .patch('/:roleId/permissions', isAuthorizedAndHasPermission, addRolePermissionsController)
  .delete('/:roleId/permissions/:permissionId', isAuthorizedAndHasPermission, removeRolePermissionController);

export default router;
