import express from 'express';
const router = express.Router();

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  removeUserByIdController,
  checkExistEmailController,
} from '#src/app/users/users.controller';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';

router.post('/is-exist-email', checkExistEmailController);

router
  .post('/create-user', isAuthorizedAndHasPermission, createUserController)
  .get('/get-users', isAuthorizedAndHasPermission, getAllUsersController)
  .get('/get-user-by-id/:userId', isAuthorizedAndHasPermission, getUserByIdController)
  .put('/update-user-by-id/:userId', isAuthorizedAndHasPermission, updateUserByIdController)
  .delete('/remove-user-by-id/:userId', isAuthorizedAndHasPermission, removeUserByIdController);

export default router;
