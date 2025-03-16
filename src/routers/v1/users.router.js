import express from 'express';
const router = express.Router();

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  removeUserByIdController,
  checkExistEmailController,
} from '#src/app/v1/users/users.controller';
import { isAuthorizedAndHasPermission } from '#src/middlewares/jwt-auth.middleware';
import { CreateUserDto } from '#src/app/v1/users/dtos/create-user.dto';
import { UpdateUserDto } from '#src/app/v1/users/dtos/update-user.dto';
import { CheckExistEmailDto } from '#src/app/v1/users/dtos/check-exist-email.dto';
import { validateBody } from '#src/core/validations/request.validation';

router.post('/is-exist-email', validateBody(CheckExistEmailDto), checkExistEmailController);

router
  .post('/create-user', isAuthorizedAndHasPermission, validateBody(CreateUserDto), createUserController)
  .get('/get-users', isAuthorizedAndHasPermission, getAllUsersController)
  .get('/get-user-by-id/:id', isAuthorizedAndHasPermission, getUserByIdController)
  .patch('/update-user-by-id/:id', isAuthorizedAndHasPermission, validateBody(UpdateUserDto), updateUserByIdController)
  .delete('/remove-user-by-id/:id', isAuthorizedAndHasPermission, removeUserByIdController);

export default router;
