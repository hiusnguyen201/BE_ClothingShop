import express from 'express';
const router = express.Router();

import { getAllPermissionsController } from '#src/app/permissions/permissions.controller';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.get('/get-permissions', isAuthorizedAndHasPermission, getAllPermissionsController);

export default router;
