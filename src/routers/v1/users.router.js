import express from 'express';
const router = express.Router();

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController,
  removeUserByIdController,
  checkExistEmailController,
} from '#app/users/users.controller';
import { createUserDto } from '#app/users/dto/create-user.dto';
import { updateUserDto } from '#app/users/dto/update-user.dto';
import { getAllUsersDto } from '#app/users/dto/get-all-users.dto';
import { getUserDto } from '#src/app/users/dto/get-user.dto';
import { validateSchema, validateFile } from '#middlewares/validate-request.middleware';
import { UploadUtils } from '#utils/upload.util';
import { ALLOW_IMAGE_MIME_TYPES } from '#core/constant';
import { checkExistEmailDto } from '#app/users/dto/check-exist-email.dto';
import { isAuthorizedAndHasPermission } from '#middlewares/jwt-auth.middleware';

const upload = UploadUtils.config({
  allowedMimeTypes: ALLOW_IMAGE_MIME_TYPES,
});

router.post('/is-exist-email', validateSchema(checkExistEmailDto), checkExistEmailController);

router.use([isAuthorizedAndHasPermission]);
router
  .get('/get-users', validateSchema(getAllUsersDto, 'query'), getAllUsersController)
  .get('/get-user-by-id/:userId', validateSchema(getUserDto, 'params'), getUserByIdController)
  .post('/create-user', validateFile(upload.single('avatar')), validateSchema(createUserDto), createUserController)
  .patch(
    '/update-user-by-id/:userId',
    validateSchema(getUserDto, 'params'),
    validateFile(upload.single('avatar')),
    validateSchema(updateUserDto),
    updateUserByIdController,
  )
  .delete('/remove-user-by-id/:userId', validateSchema(getUserDto, 'params'), removeUserByIdController);

export default router;
