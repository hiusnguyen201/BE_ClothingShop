import express from 'express';
const router = express.Router();

import { exportPermissionsController, getAllPermissionsController } from '#src/app/permissions/permissions.controller';
import { isAuthorized, can } from '#src/middlewares/jwt-auth.middleware';
import { EXPORT_PERMISSIONS, PERMISSIONS_PERMISSIONS } from '#src/database/data/permissions-data';

router
  .get(
    '/get-permissions',
    isAuthorized,
    can([PERMISSIONS_PERMISSIONS.GET_PERMISSIONS.name]),
    getAllPermissionsController,
  )
  .get('/export-excel', isAuthorized, can([EXPORT_PERMISSIONS.PERMISSION_EXCEL.name]), exportPermissionsController);

export default router;
