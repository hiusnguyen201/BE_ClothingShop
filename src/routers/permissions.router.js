import express from 'express';
const router = express.Router();

import { getAllPermissionsController } from '#src/app/permissions/permissions.controller';
import { isAuthorized, can } from '#src/middlewares/jwt-auth.middleware';
import { PERMISSIONS_PERMISSIONS } from '#src/database/data/permissions-data';

router.get(
  '/get-permissions',
  isAuthorized,
  can([PERMISSIONS_PERMISSIONS.GET_PERMISSIONS.name]),
  getAllPermissionsController,
);

export default router;
