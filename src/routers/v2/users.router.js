import express from 'express';
const router = express.Router();

import userController from '#app/v2/users/UserController';
import { UploadUtils } from '#utils/upload.util';
import { isAuthorizedAndHasPermission } from '#middlewares/jwt-auth.middleware';

// router.use([isAuthorizedAndHasPermission]);
router.post('/', UploadUtils.single('avatar'), userController.createUser);
router.get('/', userController.getUserList);
router.get('/:userId', userController.getUserById);
router.patch('/:userId', userController.updateUserInfoById);
router.patch('/:userId/avatar', UploadUtils.single('avatar'), userController.updateUserAvatarById);
router.delete('/:userId', userController.removeUserById);

export default router;
