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
import { CreateUserDto } from '#src/app/users/dtos/create-user.dto';
import { UpdateUserDto } from '#src/app/users/dtos/update-user.dto';
import { CheckExistEmailDto } from '#src/app/users/dtos/check-exist-email.dto';
import { validateBody, validateParams, validateQuery } from '#src/core/validations/request.validation';
import { GetListUserDto } from '#src/app/users/dtos/get-list-user.dto';
import { GetUserDto } from '#src/app/users/dtos/get-user.dto';

router.post('/is-exist-email', validateBody(CheckExistEmailDto), checkExistEmailController);

router
  .post('/create-user', isAuthorizedAndHasPermission, validateBody(CreateUserDto), createUserController)
  .get('/get-users', isAuthorizedAndHasPermission, validateQuery(GetListUserDto), getAllUsersController)
  .get('/get-user-by-id/:userId', isAuthorizedAndHasPermission, validateParams(GetUserDto), getUserByIdController)
  .put(
    '/update-user-by-id/:userId',
    isAuthorizedAndHasPermission,
    validateParams(GetUserDto),
    validateBody(UpdateUserDto),
    updateUserByIdController,
  )
  .delete(
    '/remove-user-by-id/:userId',
    isAuthorizedAndHasPermission,
    validateParams(GetUserDto),
    removeUserByIdController,
  );
// .get(
//   '/:userId/permissions',
//   isAuthorizedAndHasPermission,
//   validateQuery(GetListUserPermissionsDto),
//   getListUserPermissionsController,
// )
// .patch(
//   '/:userId/permissions',
//   isAuthorizedAndHasPermission,
//   validateBody(AddUserPermissionsDto),
//   addUserPermissionsController,
// )
// .delete(
//   '/:userId/permissions/:permissionId',
//   isAuthorizedAndHasPermission,
//   validateParams(RemoveUserPermissionDto),
//   removeUserPermissionController,
// );

export default router;
