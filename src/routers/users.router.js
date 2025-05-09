import express from 'express';
const router = express.Router();

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  removeUserByIdController,
  checkExistEmailController,
  resetPasswordUserController,
} from '#src/app/users/users.controller';
import { isAuthorized, can } from '#src/middlewares/jwt-auth.middleware';
import { USERS_PERMISSIONS } from '#src/database/data/permissions-data';

router.post('/is-exist-email', checkExistEmailController);

router
  .post('/create-user', isAuthorized, can([USERS_PERMISSIONS.CREATE_USER.name]), createUserController)
  .get('/get-users', isAuthorized, can([USERS_PERMISSIONS.GET_USERS.name]), getAllUsersController)
  .get('/get-user-by-id/:userId', isAuthorized, can([USERS_PERMISSIONS.GET_USER_DETAILS.name]), getUserByIdController)
  .put('/update-user-by-id/:userId', isAuthorized, can([USERS_PERMISSIONS.EDIT_USER.name]), updateUserByIdController)
  .delete(
    '/remove-user-by-id/:userId',
    isAuthorized,
    can([USERS_PERMISSIONS.REMOVE_USER.name]),
    removeUserByIdController,
  )
  .put(
    '/:userId/reset-password',
    isAuthorized,
    can([USERS_PERMISSIONS.RESET_PASSWORD_USER.name]),
    resetPasswordUserController,
  );

export default router;
