import express from 'express';
const router = express.Router();

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  removeUserByIdController,
  checkExistEmailController,
} from '#app/v1/users/users.controller';
import { isAuthorizedAndHasPermission } from '#middlewares/jwt-auth.middleware';
import { UploadUtils } from '#utils/upload.util';
import { ALLOW_IMAGE_MIME_TYPES } from '#core/constant';
import { CreateUserDto } from '#app/v1/users/dtos/create-user.dto';
import { UpdateUserDto } from '#app/v1/users/dtos/update-user.dto';
import { CheckExistEmailDto } from '#app/v1/users/dtos/check-exist-email.dto';
import { validateBody, validateFile } from '#core/validations/request.validation';

const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router.post('/is-exist-email', validateBody(CheckExistEmailDto), checkExistEmailController);

router
  .post(
    '/create-user',
    isAuthorizedAndHasPermission,
    validateFile(upload.single('avatar')),
    validateBody(CreateUserDto),
    createUserController,
  )
  .get('/get-users', isAuthorizedAndHasPermission, getAllUsersController)
  .get('/get-user-by-id/:id', isAuthorizedAndHasPermission, getUserByIdController)
  .patch(
    '/update-user-by-id/:id',
    isAuthorizedAndHasPermission,
    validateFile(upload.single('avatar')),
    validateBody(UpdateUserDto),
    updateUserByIdController,
  )
  .delete('/remove-user-by-id/:id', isAuthorizedAndHasPermission, removeUserByIdController);

export default router;
