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
import { createUserDto } from '#app/v1/users/dtos/create-user.dto';
import { updateUserDto } from '#app/v1/users/dtos/update-user.dto';
import { checkExistEmailDto } from '#app/v1/users/dtos/check-exist-email.dto';
import { validateBody, validateFile } from '#core/validations/request.validation';

const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router.post('/is-exist-email', validateBody(checkExistEmailDto), checkExistEmailController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-users', getAllUsersController)
  .get('/get-user-by-id/:id', getUserByIdController)
  .post('/create-user', validateFile(upload.single('avatar')), validateBody(createUserDto), createUserController)
  .patch(
    '/update-user-by-id/:id',
    validateFile(upload.single('avatar')),
    validateBody(updateUserDto),
    updateUserByIdController,
  )
  .delete('/remove-user-by-id/:id', removeUserByIdController);

export default router;
