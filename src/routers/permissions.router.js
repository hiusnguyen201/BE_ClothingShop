import express from 'express';
const router = express.Router();

import { getAllPermissionsController } from '#src/app/permissions/permissions.controller';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { validateQuery } from '#src/core/validations/request.validation';
import { GetListPermissionDto } from '#src/app/permissions/dtos/get-list-permission.dto';

router.get(
  '/get-permissions',
  isAuthorizedAndHasPermission,
  validateQuery(GetListPermissionDto),
  getAllPermissionsController,
);

export default router;
